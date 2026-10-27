from typing import Optional, List
from app.models.schemas import TerminalCommandResponse
from app.services.retrieval import get_retriever
from app.api.routes.technologies import TECHNOLOGY_REGISTRY


class SafeCommandInterpreter:
    """
    In-memory, safe command interpreter for the haunted terminal.
    Contains strictly zero eval, exec, subprocess, or shell execution.
    Operates solely on application domain data and verified archives.
    """

    HELP_TEXT = (
        "HAUNTED TERMINAL COMMAND SUBSYSTEM (v1.0)\n"
        "==========================================================\n"
        "  help              - Display this list of terminal commands\n"
        "  whoami            - Identify current technology spirit and registers\n"
        "  list              - List all discoverable forgotten computing spirits\n"
        "  switch <tech>     - Tune frequency to another spirit (cobol, fortran, basic, assembly)\n"
        "  search <query>    - Query the historical archive directly via BM25\n"
        "  inspect <doc_id>  - Inspect full archived document records\n"
        "  history           - Review recent transcripts in current channel\n"
        "  clear             - Clear terminal screen buffer\n"
        "  exit              - Terminate session and return to archive index\n"
        "=========================================================="
    )

    def execute(self, command_line: str, current_technology_id: Optional[str] = None) -> TerminalCommandResponse:
        tokens = command_line.strip().split()
        if not tokens:
            return TerminalCommandResponse(
                command="",
                output="Empty command. Type 'help' for available instructions.",
                command_type="error",
            )

        cmd = tokens[0].lower()
        args = tokens[1:]

        if cmd == "help":
            return TerminalCommandResponse(
                command=cmd,
                output=self.HELP_TEXT,
                command_type="info",
            )

        elif cmd == "whoami":
            current_tech = (current_technology_id or "cobol").lower()
            if current_tech in TECHNOLOGY_REGISTRY:
                info = TECHNOLOGY_REGISTRY[current_tech]
                output = (
                    f"ACTIVE SPIRIT CHANNEL: {info['name'].upper()}\n"
                    f"DESIGNATION: {info['title']}\n"
                    f"CHRONOLOGY: {info['era']}\n"
                    f"CORE ATTRIBUTES: {info['personality']}\n"
                    "Status: Machine memories accessible. Ask questions or type 'help'."
                )
            else:
                output = "CHANNEL: UNKNOWN ENTITY. Type 'list' or 'switch <tech>' to bind."
            return TerminalCommandResponse(command=cmd, output=output, command_type="info")

        elif cmd == "list":
            lines = ["ARCHIVE REPOSITORY — AVAILABLE MACHINE SPIRITS:"]
            for tid, data in TECHNOLOGY_REGISTRY.items():
                marker = "*" if tid == (current_technology_id or "cobol").lower() else " "
                lines.append(f"  [{marker}] {tid.upper():<10} - {data['name']}: {data['title']} ({data['era']})")
            lines.append("\nType 'switch <tech>' (e.g., 'switch fortran') to change channel.")
            return TerminalCommandResponse(command=cmd, output="\n".join(lines), command_type="info")

        elif cmd == "switch":
            if not args:
                return TerminalCommandResponse(
                    command=cmd,
                    output="Usage: switch <cobol | fortran | basic | assembly>",
                    command_type="error",
                )
            target = args[0].lower()
            if target not in TECHNOLOGY_REGISTRY:
                return TerminalCommandResponse(
                    command=cmd,
                    output=f"Unknown technology '{target}'. Available: cobol, fortran, basic, assembly.",
                    command_type="error",
                )
            info = TECHNOLOGY_REGISTRY[target]
            return TerminalCommandResponse(
                command=cmd,
                output=f"Tuning frequency... Connected to {info['name']} ({info['title']}).\n{info['intro_message']}",
                command_type="navigation",
                new_technology_id=target,
            )

        elif cmd == "search":
            if not args:
                return TerminalCommandResponse(
                    command=cmd,
                    output="Usage: search <query terms>",
                    command_type="error",
                )
            query = " ".join(args)
            retriever = get_retriever()
            results = retriever.search(query, technology_filter=current_technology_id, top_k=3)
            if not results:
                # Try search across entire archive without filter
                results = retriever.search(query, top_k=3)

            if not results:
                return TerminalCommandResponse(
                    command=cmd,
                    output=f"No verified documents found matching query: '{query}'.",
                    command_type="info",
                )

            lines = [f"ARCHIVE SEARCH RESULTS FOR: '{query}'"]
            for i, r in enumerate(results, 1):
                lines.append(f"  [{i}] ID: {r.document_id}")
                lines.append(f"      Title: {r.title}")
                lines.append(f"      Topic: {r.topic} ({r.technology.upper()})")
                lines.append(f"      Source: {r.source_title}")
                lines.append(f"      URL: {r.source_url}")
                lines.append(f"      Excerpt: {r.excerpt[:150]}...")
                lines.append("")
            lines.append("Type 'inspect <doc_id>' to read a complete archival record.")
            return TerminalCommandResponse(command=cmd, output="\n".join(lines), command_type="info")

        elif cmd == "inspect":
            if not args:
                return TerminalCommandResponse(
                    command=cmd,
                    output="Usage: inspect <document_id> (e.g., inspect cobol_codasyl_origins)",
                    command_type="error",
                )
            doc_id = args[0].strip()
            retriever = get_retriever()
            doc = retriever.get_document_by_id(doc_id)
            if not doc:
                return TerminalCommandResponse(
                    command=cmd,
                    output=f"Document ID '{doc_id}' not found in archive. Type 'search <topic>' to locate records.",
                    command_type="error",
                )
            output = (
                f"DOCUMENT RECORD: {doc['document_id']}\n"
                f"TITLE: {doc.get('title')}\n"
                f"TOPIC: {doc.get('topic')}\n"
                f"DATE: {doc.get('publication_date')}\n"
                f"SOURCE: {doc.get('source_title')}\n"
                f"URL: {doc.get('source_url')}\n"
                f"----------------------------------------------------------\n"
                f"{doc.get('content')}"
            )
            return TerminalCommandResponse(command=cmd, output=output, command_type="info")

        elif cmd == "clear":
            return TerminalCommandResponse(
                command=cmd,
                output="Buffer cleared.",
                command_type="clear",
            )

        elif cmd == "exit":
            return TerminalCommandResponse(
                command=cmd,
                output="Disconnecting session... Returning to main archive directory.",
                command_type="navigation",
            )

        elif cmd == "history":
            return TerminalCommandResponse(
                command=cmd,
                output="Session channel active. Inspect previous turns in the transcript above or open the Memory Vault.",
                command_type="info",
            )

        else:
            return TerminalCommandResponse(
                command=cmd,
                output=f"Unknown command '{cmd}'. Type 'help' for the list of supported instructions.",
                command_type="error",
            )


_interpreter_instance: Optional[SafeCommandInterpreter] = None


def get_command_interpreter() -> SafeCommandInterpreter:
    global _interpreter_instance
    if _interpreter_instance is None:
        _interpreter_instance = SafeCommandInterpreter()
    return _interpreter_instance
