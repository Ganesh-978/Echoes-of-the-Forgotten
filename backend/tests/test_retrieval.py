import pytest
from app.services.retrieval import get_retriever, tokenize


def test_tokenize():
    tokens = tokenize("Who was Grace Hopper and what is CODASYL in 1959?")
    assert "grace" in tokens
    assert "hopper" in tokens
    assert "codasyl" in tokens
    assert "1959" in tokens
    # Stopwords should be removed
    assert "who" not in tokens
    assert "and" not in tokens
    assert "what" not in tokens


def test_retriever_document_loading():
    retriever = get_retriever()
    assert len(retriever.documents) >= 8
    technologies = {doc["technology"] for doc in retriever.documents}
    assert "cobol" in technologies
    assert "fortran" in technologies
    assert "basic" in technologies
    assert "assembly" in technologies


def test_relevant_search_cobol():
    retriever = get_retriever()
    results = retriever.search("Grace Hopper FLOW-MATIC CODASYL Pentagon")
    assert len(results) > 0
    top = results[0]
    assert top.technology == "cobol"
    assert "CODASYL" in top.title
    assert "computerhistory.org" in top.source_url
    assert top.relevance_score is not None
    assert top.relevance_score > 0.5


def test_relevant_search_fortran():
    retriever = get_retriever()
    results = retriever.search("John Backus IBM optimizing compiler 704")
    assert len(results) > 0
    top = results[0]
    assert top.technology == "fortran"
    assert "Backus" in top.title
    assert "acm.org" in top.source_url


def test_relevant_search_basic():
    retriever = get_retriever()
    results = retriever.search("Dartmouth time-sharing Kemeny Kurtz 1964")
    assert len(results) > 0
    top = results[0]
    assert top.technology == "basic"
    assert "Dartmouth" in top.title
    assert "dartmouth.edu" in top.source_url


def test_relevant_search_assembly():
    retriever = get_retriever()
    results = retriever.search("Kathleen Booth Birkbeck College mnemonics")
    assert len(results) > 0
    top = results[0]
    assert top.technology == "assembly"
    assert "Kathleen Booth" in top.title
    assert "bbk.ac.uk" in top.source_url


def test_technology_filter():
    retriever = get_retriever()
    # Search for compiler, but strictly filter to fortran
    fortran_results = retriever.search("compiler", technology_filter="fortran")
    for r in fortran_results:
        assert r.technology == "fortran"


def test_irrelevant_query_returns_no_unrelated_documents():
    retriever = get_retriever()
    # Query unrelated to the computing history archive
    results = retriever.search("quantum teleportation alien spaceship Mars colony pizza delivery", min_score=1.0)
    assert len(results) == 0
