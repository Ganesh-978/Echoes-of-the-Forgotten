import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.ai_provider import OfflineArchiveProvider
from app.services.prompt_builder import build_system_prompt, build_user_prompt
from app.models.schemas import SourceReference


@pytest.mark.asyncio
async def test_offline_chat_cobol():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/chat",
            json={
                "technology_id": "cobol",
                "message": "Who created COBOL and what is FLOW-MATIC?",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["technology_id"] == "cobol"
        assert "conversation_id" in data
        assert len(data["reply"]) > 0
        assert data["is_offline_synthesis"] is True
        assert len(data["sources"]) > 0
        assert "computerhistory.org" in data["sources"][0]["source_url"]


@pytest.mark.asyncio
async def test_chat_invalid_technology():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/chat",
            json={
                "technology_id": "nonexistent_lang",
                "message": "Hello machine spirit",
            },
        )
        assert response.status_code == 404


@pytest.mark.asyncio
async def test_chat_empty_message_validation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/chat",
            json={
                "technology_id": "basic",
                "message": "",
            },
        )
        assert response.status_code == 422


@pytest.mark.asyncio
async def test_offline_provider_unrelated_query():
    provider = OfflineArchiveProvider()
    sources = []
    user_prompt = build_user_prompt("arbitrary Martian signals", sources)
    messages = [
        {"role": "system", "content": build_system_prompt("Assembly", "Low level")},
        {"role": "user", "content": user_prompt},
    ]
    reply = await provider.generate_response(messages)
    assert "no historical passages matching this inquiry" in reply
