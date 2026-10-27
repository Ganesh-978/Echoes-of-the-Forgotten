import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_get_technologies():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/technologies")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 4
        tech_ids = [t["id"] for t in data]
        assert "cobol" in tech_ids
        assert "fortran" in tech_ids
        assert "basic" in tech_ids
        assert "assembly" in tech_ids


@pytest.mark.asyncio
async def test_get_single_technology():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/technologies/cobol")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "cobol"
        assert "Grace Hopper" in data["system_prompt"]
        assert len(data["suggested_questions"]) > 0


@pytest.mark.asyncio
async def test_get_nonexistent_technology():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/technologies/nonexistent")
        assert response.status_code == 404


@pytest.mark.asyncio
async def test_search_api_with_results():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/search?q=Grace+Hopper+FLOW-MATIC")
        assert response.status_code == 200
        data = response.json()
        assert data["total_matches"] > 0
        first_result = data["results"][0]
        assert "source_url" in first_result
        assert "computerhistory.org" in first_result["source_url"]


@pytest.mark.asyncio
async def test_search_api_with_filter():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/search?q=compiler&tech=fortran")
        assert response.status_code == 200
        data = response.json()
        for res in data["results"]:
            assert res["technology"] == "fortran"
