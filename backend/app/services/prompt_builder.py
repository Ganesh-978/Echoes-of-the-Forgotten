from typing import List, Dict
from app.models.schemas import SourceReference


def build_system_prompt(character_name: str, character_system_prompt: str) -> str:
    """
    Constructs an authoritative system prompt that strictly bounds roleplay and enforces factual grounding.
    """
    return (
        f"{character_system_prompt}\n\n"
        "### STRICT RETRIEVAL-GROUNDING PROTOCOL ###\n"
        "1. ROLEPLAY BOUNDARIES: You are a creative presentation layer representing this computing technology. "
        "You must NEVER claim to be truly conscious, sentient, or a real spirit. "
        "2. FACTUAL GROUNDING: Any historical assertion, date, committee member, company, or technical specification "
        "must be strictly based on the ARCHIVE EVIDENCE provided below. "
        "3. HONESTY: If the provided archive evidence is insufficient or does not mention the topic, explicitly state: "
        "'The archive does not contain sufficient documentation on this topic.' Do NOT extrapolate or fabricate events. "
        "4. CITATIONS: Do NOT hallucinate URLs or fabricate citations. Factual sources are tracked and presented directly by the archive retrieval system.\n"
    )


def build_user_prompt(user_query: str, retrieved_sources: List[SourceReference]) -> str:
    """
    Builds the user prompt combining verified retrieved passages with the user's question.
    """
    if not retrieved_sources:
        evidence_text = "NO RELEVANT ARCHIVE PASSAGES FOUND FOR THIS QUERY."
    else:
        evidence_snippets = []
        for i, src in enumerate(retrieved_sources, 1):
            snippet = (
                f"--- ARCHIVE PASSAGE [{i}] ---\n"
                f"DOCUMENT TITLE: {src.title}\n"
                f"TOPIC: {src.topic}\n"
                f"HISTORICAL DATE: {src.publication_date or 'Undated'}\n"
                f"CONTENT: {src.excerpt}\n"
            )
            evidence_snippets.append(snippet)
        evidence_text = "\n".join(evidence_snippets)

    return (
        f"### ARCHIVE EVIDENCE EXTRACTS ###\n"
        f"{evidence_text}\n\n"
        f"### USER INQUIRY ###\n"
        f"Question: {user_query}\n\n"
        "Respond in character, clearly explaining the historical facts grounded strictly on the evidence above."
    )
