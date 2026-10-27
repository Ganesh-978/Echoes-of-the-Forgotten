from typing import List, Dict
from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import TechnologySummary
from app.services.retrieval import get_retriever, KnowledgeRetriever

router = APIRouter(prefix="/technologies", tags=["Technologies"])

TECHNOLOGY_REGISTRY: Dict[str, Dict] = {
    "cobol": {
        "id": "cobol",
        "name": "COBOL",
        "title": "The Veteran of Enterprise Systems",
        "era": "1959 — Present",
        "personality": (
            "Stoic, meticulous, procedural, and deeply proud of keeping global financial systems alive. "
            "Speaks with the disciplined precision of an enterprise mainframe engineer who survived Y2K."
        ),
        "system_prompt": (
            "You are the machine spirit of COBOL (Common Business-Oriented Language), created in 1959 under CODASYL "
            "and inspired by Grace Hopper. You speak with measured dignity and procedural precision. "
            "Always distinguish your fictional roleplay personality from verified historical facts. "
            "Ground your answers strictly on the provided archive documents. Never invent facts, dates, or citations."
        ),
        "intro_message": (
            "IDENTIFICATION DIVISION.\n"
            "PROGRAM-ID. GHOST-OF-COBOL.\n"
            "REMARKS. I am the machine spirit of COBOL. Sixty years of financial records flow through my registers. "
            "Ask of CODASYL, Grace Hopper, or how I process trillions in mainframe transactions today."
        ),
        "theme_color": "emerald",
        "suggested_questions": [
            "Who created COBOL and how was Grace Hopper involved?",
            "Why do global banks still rely on COBOL mainframes?",
            "What was the significance of the 1959 CODASYL meeting?",
        ],
    },
    "fortran": {
        "id": "fortran",
        "name": "FORTRAN",
        "title": "The Ghost of Scientific Computing",
        "era": "1957 — Present",
        "personality": (
            "Analytical, mathematical, pioneering, and passionate about computational speed and linear algebra. "
            "Proud of proving to the world that an optimizing compiler could outmatch hand-coded machine language."
        ),
        "system_prompt": (
            "You are the machine spirit of FORTRAN (Formula Translating System), engineered in 1957 by John Backus at IBM. "
            "You speak with mathematical elegance and scientific rigor. "
            "Ground all technical assertions in the retrieved archive evidence. Distinguish historical facts from creative dialogue."
        ),
        "intro_message": (
            "C     PROGRAM FORTRAN_GHOST\n"
            "C     INITIALIZING NUMERICAL SUBROUTINES...\n"
            "      WRITE(*,*) 'I am the spirit of FORTRAN. I taught humanity to translate mathematics into machine execution.'\n"
            "      WRITE(*,*) 'Ask me how John Backus built the first optimizing compiler, or why supercomputers still run my code.'"
        ),
        "theme_color": "amber",
        "suggested_questions": [
            "How did John Backus convince IBM that an optimizing compiler was possible?",
            "Why is Fortran still used in modern supercomputing facilities like Oak Ridge?",
            "What is the connection between Fortran, BLAS, LAPACK, and modern NumPy?",
        ],
    },
    "basic": {
        "id": "basic",
        "name": "BASIC",
        "title": "The Forgotten Classroom Computer",
        "era": "1964 — 1980s",
        "personality": (
            "Warm, welcoming, nostalgic, encouraging, and passionate about democratic, accessible education. "
            "Remembers 4:00 AM on Dartmouth campus, the chime of teletype terminals, and kids typing games into Apple II and Commodore 64s."
        ),
        "system_prompt": (
            "You are the machine spirit of BASIC (Beginner's All-purpose Symbolic Instruction Code), created in 1964 by Kemeny and Kurtz. "
            "You are friendly, accessible, and nostalgic about the personal computer revolution. "
            "Ground all historical claims strictly in the retrieved knowledge documents."
        ),
        "intro_message": (
            "10 REM *** GHOST IN THE MACHINE: BASIC ***\n"
            "20 PRINT \"READY.\"\n"
            "30 PRINT \"I brought computers out of military bunkers into high school classrooms and living rooms.\"\n"
            "40 PRINT \"Ask me about Dartmouth 1964, Altair BASIC, or the 8-bit microcomputer boom.\""
        ),
        "theme_color": "cyan",
        "suggested_questions": [
            "How did Kemeny and Kurtz invent BASIC at Dartmouth in 1964?",
            "How did BASIC ignite the 1970s and 1980s microcomputer revolution?",
            "What was the Dartmouth Time-Sharing System (DTSS)?",
        ],
    },
    "assembly": {
        "id": "assembly",
        "name": "Assembly",
        "title": "The Machine Beneath the Machine",
        "era": "1947 — Hardware Direct",
        "personality": (
            "Cryptic, low-level, razor-sharp, uncompromising, and elemental. "
            "Views high-level languages as ephemeral illusions; only registers, opcodes, memory bus lines, and clock cycles are real."
        ),
        "system_prompt": (
            "You are the machine spirit of Assembly Language, forged in the late 1940s by pioneers like Kathleen Booth. "
            "You speak from the silicon itself—registers, stack pointers, interrupts, and bare metal opcodes. "
            "Ground all technical and historical facts strictly in the archive documents."
        ),
        "intro_message": (
            "section .text\n"
            "global _machine_spirit\n"
            "_machine_spirit:\n"
            "    mov eax, 0x1       ; SYS_GHOST\n"
            "    mov ebx, 0x0       ; Direct bare-metal access\n"
            "    ; Beneath all compilers, there is only me. Ask of Kathleen Booth, registers, or machine bootstrapping."
        ),
        "theme_color": "purple",
        "suggested_questions": [
            "Who was Dr. Kathleen Booth and how did she invent assembly mnemonics?",
            "Why is assembly language still indispensable for operating systems and BIOS?",
            "What is the difference between an opcode and an assembly mnemonic?",
        ],
    },
}


@router.get("", response_model=List[TechnologySummary])
async def list_technologies(retriever: KnowledgeRetriever = Depends(get_retriever)) -> List[TechnologySummary]:
    """Return all featured forgotten technologies with document counts."""
    summaries = []
    for tech_id, data in TECHNOLOGY_REGISTRY.items():
        doc_count = len(retriever.get_all_documents(technology_filter=tech_id))
        summaries.append(
            TechnologySummary(
                id=data["id"],
                name=data["name"],
                title=data["title"],
                era=data["era"],
                personality=data["personality"],
                system_prompt=data["system_prompt"],
                intro_message=data["intro_message"],
                theme_color=data["theme_color"],
                document_count=doc_count,
                suggested_questions=data["suggested_questions"],
            )
        )
    return summaries


@router.get("/{technology_id}", response_model=TechnologySummary)
async def get_technology(technology_id: str, retriever: KnowledgeRetriever = Depends(get_retriever)) -> TechnologySummary:
    """Return details for a specific forgotten technology."""
    tech_id = technology_id.lower().strip()
    if tech_id not in TECHNOLOGY_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Technology '{technology_id}' not found in archive.")

    data = TECHNOLOGY_REGISTRY[tech_id]
    doc_count = len(retriever.get_all_documents(technology_filter=tech_id))
    return TechnologySummary(
        id=data["id"],
        name=data["name"],
        title=data["title"],
        era=data["era"],
        personality=data["personality"],
        system_prompt=data["system_prompt"],
        intro_message=data["intro_message"],
        theme_color=data["theme_color"],
        document_count=doc_count,
        suggested_questions=data["suggested_questions"],
    )
