import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional, Dict, Any
from app.core.config import get_settings


class DatabaseRepository:
    """
    SQLite persistence layer for conversations, messages, and saved discoveries.
    Uses parameterized queries and transactions to ensure safety and data integrity.
    """

    def __init__(self, db_path: Optional[str] = None):
        if db_path is None:
            settings = get_settings()
            db_path = settings.DATABASE_PATH

        self.db_path = Path(db_path)
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        # Enable foreign keys and WAL mode for reliability
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.execute("PRAGMA journal_mode = WAL;")
        return conn

    def _init_db(self) -> None:
        """Create tables if they do not exist."""
        with self._get_connection() as conn:
            cursor = conn.cursor()

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                technology_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            """)

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                is_offline INTEGER DEFAULT 0,
                sources_json TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
            );
            """)

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS discoveries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                technology_id TEXT NOT NULL,
                source_urls_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            """)

            conn.commit()

    def record_message(
        self,
        conversation_id: str,
        technology_id: str,
        role: str,
        content: str,
        is_offline: bool = False,
        sources: Optional[List[Dict[str, Any]]] = None,
    ) -> None:
        """Insert a message and update or create its conversation parent."""
        now = datetime.now(timezone.utc).isoformat()
        sources_str = json.dumps(sources) if sources else "[]"

        with self._get_connection() as conn:
            cursor = conn.cursor()
            # Upsert conversation
            cursor.execute(
                """
                INSERT INTO conversations (id, technology_id, created_at, updated_at)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET updated_at = excluded.updated_at;
                """,
                (conversation_id, technology_id, now, now),
            )

            # Insert message
            cursor.execute(
                """
                INSERT INTO messages (conversation_id, role, content, is_offline, sources_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?);
                """,
                (conversation_id, role, content, 1 if is_offline else 0, sources_str, now),
            )
            conn.commit()

    def get_conversation_messages(self, conversation_id: str) -> List[Dict[str, Any]]:
        """Retrieve all messages for a specific conversation in chronological order."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, conversation_id, role, content, is_offline, sources_json, created_at
                FROM messages
                WHERE conversation_id = ?
                ORDER BY id ASC;
                """,
                (conversation_id,),
            )
            rows = cursor.fetchall()

            messages = []
            for row in rows:
                sources = []
                if row["sources_json"]:
                    try:
                        sources = json.loads(row["sources_json"])
                    except Exception:
                        sources = []
                messages.append({
                    "id": row["id"],
                    "conversation_id": row["conversation_id"],
                    "role": row["role"],
                    "content": row["content"],
                    "is_offline": bool(row["is_offline"]),
                    "sources": sources,
                    "created_at": row["created_at"],
                })
            return messages

    def list_conversations(self) -> List[Dict[str, Any]]:
        """List all conversations with summary information."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT 
                    c.id as conversation_id,
                    c.technology_id,
                    c.created_at,
                    c.updated_at,
                    COUNT(m.id) as message_count,
                    COALESCE(
                        (SELECT content FROM messages WHERE conversation_id = c.id AND role = 'user' ORDER BY id ASC LIMIT 1),
                        'No user messages'
                    ) as first_message
                FROM conversations c
                LEFT JOIN messages m ON c.id = m.conversation_id
                GROUP BY c.id
                ORDER BY c.updated_at DESC;
                """
            )
            rows = cursor.fetchall()
            return [
                {
                    "conversation_id": row["conversation_id"],
                    "technology_id": row["technology_id"],
                    "created_at": row["created_at"],
                    "updated_at": row["updated_at"],
                    "message_count": row["message_count"],
                    "first_message": row["first_message"][:100],
                }
                for row in rows
            ]

    def delete_conversation(self, conversation_id: str) -> bool:
        """Delete a conversation and all its associated messages."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM messages WHERE conversation_id = ?;", (conversation_id,))
            cursor.execute("DELETE FROM conversations WHERE id = ?;", (conversation_id,))
            conn.commit()
            return cursor.rowcount > 0

    def save_discovery(
        self,
        title: str,
        content: str,
        technology_id: str,
        source_urls: List[str],
    ) -> Dict[str, Any]:
        """Save a historical discovery to the memory vault."""
        now = datetime.now(timezone.utc).isoformat()
        urls_json = json.dumps(source_urls)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO discoveries (title, content, technology_id, source_urls_json, created_at)
                VALUES (?, ?, ?, ?, ?);
                """,
                (title, content, technology_id, urls_json, now),
            )
            discovery_id = cursor.lastrowid
            conn.commit()

            return {
                "id": discovery_id,
                "title": title,
                "content": content,
                "technology_id": technology_id,
                "source_urls": source_urls,
                "created_at": now,
            }

    def list_discoveries(self) -> List[Dict[str, Any]]:
        """List all saved discoveries from the memory vault."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, title, content, technology_id, source_urls_json, created_at
                FROM discoveries
                ORDER BY id DESC;
                """
            )
            rows = cursor.fetchall()
            discoveries = []
            for row in rows:
                try:
                    urls = json.loads(row["source_urls_json"])
                except Exception:
                    urls = []
                discoveries.append({
                    "id": row["id"],
                    "title": row["title"],
                    "content": row["content"],
                    "technology_id": row["technology_id"],
                    "source_urls": urls,
                    "created_at": row["created_at"],
                })
            return discoveries

    def delete_discovery(self, discovery_id: int) -> bool:
        """Delete a saved discovery by ID."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM discoveries WHERE id = ?;", (discovery_id,))
            conn.commit()
            return cursor.rowcount > 0


_repo_instance: Optional[DatabaseRepository] = None


def get_db_repository() -> DatabaseRepository:
    """Retrieve singleton database repository."""
    global _repo_instance
    if _repo_instance is None:
        _repo_instance = DatabaseRepository()
    return _repo_instance
