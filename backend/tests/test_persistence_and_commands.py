import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.terminal_commands import get_command_interpreter


def test_command_interpreter_help():
    interpreter = get_command_interpreter()
    res = interpreter.execute("help")
    assert res.command == "help"
    assert "HAUNTED TERMINAL" in res.output
    assert "search" in res.output


def test_command_interpreter_whoami():
    interpreter = get_command_interpreter()
    res = interpreter.execute("whoami", current_technology_id="cobol")
    assert "COBOL" in res.output
    assert "Enterprise" in res.output


def test_command_interpreter_switch():
    interpreter = get_command_interpreter()
    res = interpreter.execute("switch fortran")
    assert res.command_type == "navigation"
    assert res.new_technology_id == "fortran"
    assert "FORTRAN" in res.output


def test_command_interpreter_search_and_inspect():
    interpreter = get_command_interpreter()
    search_res = interpreter.execute("search Backus")
    assert "John Backus" in search_res.output or "FORTRAN" in search_res.output

    inspect_res = interpreter.execute("inspect fortran_backus_ibm")
    assert "DOCUMENT RECORD: fortran_backus_ibm" in inspect_res.output
    assert "IBM 704" in inspect_res.output


def test_command_interpreter_unknown():
    interpreter = get_command_interpreter()
    res = interpreter.execute("rm -rf /")
    assert res.command_type == "error"
    assert "Unknown command" in res.output


@pytest.mark.asyncio
async def test_command_api_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/chat/command",
            json={"command_line": "whoami", "current_technology_id": "assembly"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "ASSEMBLY" in data["output"]


@pytest.mark.asyncio
async def test_discoveries_crud_lifecycle():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create discovery
        create_res = await client.post(
            "/api/discoveries",
            json={
                "title": "CODASYL Origin Note",
                "content": "COBOL was formally specified in 1959 at the Pentagon.",
                "technology_id": "cobol",
                "source_urls": ["https://www.computerhistory.org/revolution/birth-of-modern-computers/4/98"],
            },
        )
        assert create_res.status_code == 201
        discovery = create_res.json()
        discovery_id = discovery["id"]
        assert discovery["title"] == "CODASYL Origin Note"

        # List discoveries
        list_res = await client.get("/api/discoveries")
        assert list_res.status_code == 200
        discoveries = list_res.json()
        assert any(d["id"] == discovery_id for d in discoveries)

        # Delete discovery
        del_res = await client.delete(f"/api/discoveries/{discovery_id}")
        assert del_res.status_code == 200

        # Verify deletion
        list_after = await client.get("/api/discoveries")
        assert not any(d["id"] == discovery_id for d in list_after.json())


@pytest.mark.asyncio
async def test_conversations_listing_and_deletion():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Trigger chat to generate a conversation
        chat_res = await client.post(
            "/api/chat",
            json={
                "technology_id": "basic",
                "message": "When was BASIC created at Dartmouth?",
            },
        )
        assert chat_res.status_code == 200
        conv_id = chat_res.json()["conversation_id"]

        # List conversations
        convs_res = await client.get("/api/conversations")
        assert convs_res.status_code == 200
        convs = convs_res.json()
        assert any(c["conversation_id"] == conv_id for c in convs)

        # Get conversation detail
        detail_res = await client.get(f"/api/conversations/{conv_id}")
        assert detail_res.status_code == 200
        messages = detail_res.json()
        assert len(messages) >= 2  # user + assistant

        # Delete conversation
        del_res = await client.delete(f"/api/conversations/{conv_id}")
        assert del_res.status_code == 200
