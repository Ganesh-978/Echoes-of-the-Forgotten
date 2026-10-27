import json
import os
import re
from pathlib import Path
from typing import List, Optional, Dict, Any
from rank_bm25 import BM25Okapi
from app.models.schemas import SourceReference

# Stopwords list to enhance lexical tokenization
STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", 
    "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", 
    "but", "by", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", 
    "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", 
    "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", 
    "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", 
    "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", 
    "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", 
    "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", 
    "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", 
    "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", 
    "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", 
    "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", 
    "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's", 
    "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", 
    "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"
}


def tokenize(text: str) -> List[str]:
    """Tokenize and normalize text for BM25 indexing."""
    words = re.findall(r'\b[a-zA-Z0-9_\-+#]{2,}\b', text.lower())
    return [w for w in words if w not in STOPWORDS]


class KnowledgeRetriever:
    """CPU-friendly BM25 document indexing and retrieval service."""

    def __init__(self, knowledge_dir: Optional[str] = None):
        if knowledge_dir is None:
            # Default to backend/knowledge
            base_dir = Path(__file__).resolve().parent.parent.parent
            knowledge_dir = str(base_dir / "knowledge")
        self.knowledge_dir = Path(knowledge_dir)
        self.documents: List[Dict[str, Any]] = []
        self.corpus_tokens: List[List[str]] = []
        self.bm25: Optional[BM25Okapi] = None
        self.load_documents()

    def load_documents(self) -> None:
        """Scan directory and index all JSON historical documents."""
        self.documents = []
        self.corpus_tokens = []

        if not self.knowledge_dir.exists():
            return

        for root, _, files in os.walk(self.knowledge_dir):
            for file in files:
                if file.endswith(".json"):
                    file_path = Path(root) / file
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            doc = json.load(f)
                            # Ensure required fields
                            if "document_id" in doc and "content" in doc:
                                self.documents.append(doc)
                                # Combined indexable text
                                indexable_text = f"{doc.get('title', '')} {doc.get('topic', '')} {doc.get('content', '')} {doc.get('technology', '')}"
                                tokens = tokenize(indexable_text)
                                self.corpus_tokens.append(tokens)
                    except Exception as e:
                        print(f"Error loading document {file_path}: {e}")

        if self.corpus_tokens:
            self.bm25 = BM25Okapi(self.corpus_tokens)

    def search(
        self,
        query: str,
        technology_filter: Optional[str] = None,
        min_score: float = 0.5,
        top_k: int = 3,
    ) -> List[SourceReference]:
        """
        Search documents using BM25 with optional technology filter and relevance threshold.
        Avoids returning unrelated documents simply to fill top_k.
        """
        if not self.bm25 or not self.documents:
            return []

        query_tokens = tokenize(query)
        if not query_tokens:
            return []

        scores = self.bm25.get_scores(query_tokens)

        # Pair each document with its score
        scored_docs = []
        for idx, score in enumerate(scores):
            doc = self.documents[idx]

            # Filter by technology character if requested
            if technology_filter and doc.get("technology", "").lower() != technology_filter.lower():
                continue

            if score >= min_score:
                scored_docs.append((score, doc))

        # Sort descending by score
        scored_docs.sort(key=lambda x: x[0], reverse=True)

        # Format top matching results
        results: List[SourceReference] = []
        for score, doc in scored_docs[:top_k]:
            results.append(
                SourceReference(
                    document_id=doc["document_id"],
                    title=doc.get("title", "Untitled Document"),
                    topic=doc.get("topic", "General History"),
                    publication_date=doc.get("publication_date"),
                    source_title=doc.get("source_title", "Historical Archive"),
                    source_url=doc.get("source_url", ""),
                    technology=doc.get("technology", "general"),
                    excerpt=doc.get("content", "")[:350] + ("..." if len(doc.get("content", "")) > 350 else ""),
                    relevance_score=round(float(score), 3),
                )
            )

        return results

    def get_document_by_id(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve full document by unique ID."""
        for doc in self.documents:
            if doc.get("document_id") == document_id:
                return doc
        return None

    def get_all_documents(self, technology_filter: Optional[str] = None) -> List[SourceReference]:
        """List all documents in the archive."""
        results = []
        for doc in self.documents:
            if technology_filter and doc.get("technology", "").lower() != technology_filter.lower():
                continue
            results.append(
                SourceReference(
                    document_id=doc["document_id"],
                    title=doc.get("title", "Untitled Document"),
                    topic=doc.get("topic", "General History"),
                    publication_date=doc.get("publication_date"),
                    source_title=doc.get("source_title", "Historical Archive"),
                    source_url=doc.get("source_url", ""),
                    technology=doc.get("technology", "general"),
                    excerpt=doc.get("content", "")[:350] + ("..." if len(doc.get("content", "")) > 350 else ""),
                )
            )
        return results


# Global singleton instance
_retriever_instance: Optional[KnowledgeRetriever] = None


def get_retriever() -> KnowledgeRetriever:
    """Retrieve or initialize singleton retriever."""
    global _retriever_instance
    if _retriever_instance is None:
        _retriever_instance = KnowledgeRetriever()
    return _retriever_instance
