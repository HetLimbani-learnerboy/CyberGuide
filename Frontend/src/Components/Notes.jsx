import React, { useEffect, useState } from "react";
import Slidebar from "./Slidebar";
import "./NotesPage.css";

const NotesPage = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [noteForm, setNoteForm] = useState({ id: null, title: "", content: "" });
    const [isOpen, setIsOpen] = useState(false);

    const BACKEND_URL = "http://127.0.0.1:8000";
    const userEmail = localStorage.getItem("cyberguide_user_email");

    const fetchNotes = async () => {
        if (!userEmail) return;
        try {
            const res = await fetch(`${BACKEND_URL}/auth/getnotes/${userEmail}/`);
            const data = await res.json();
            setNotes(data || []);
        } catch (err) {
            console.error("Error fetching notes:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, [userEmail]);

    const handleSaveNote = async (e) => {
        e.preventDefault();
        if (!noteForm.title.trim()) return alert("Title is required");

        setIsProcessing(true);
        const url = isEditMode 
            ? `${BACKEND_URL}/auth/updatenote/${noteForm.id}/` 
            : `${BACKEND_URL}/auth/addnote/`;
        
        const method = isEditMode ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: userEmail,
                    title: noteForm.title,
                    content: noteForm.content,
                }),
            });

            if (res.ok) {
                closeModal();
                fetchNotes();
            }
        } catch (err) {
            console.error("Save error:", err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (!window.confirm("Confirm deletion of this intelligence record?")) return;
        setDeletingId(noteId); 
        try {
            const res = await fetch(`${BACKEND_URL}/auth/deletenote/${noteId}/`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: userEmail }),
            });

            if (res.ok) fetchNotes();
        } catch (err) {
            console.error("Delete error:", err);
        } finally {
            setDeletingId(null);
        }
    };

    const openEditModal = (note) => {
        setIsEditMode(true);
        setNoteForm({ id: note.id, title: note.title, content: note.content });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setIsEditMode(false);
        setNoteForm({ id: null, title: "", content: "" });
    };

    return (
        <div className="notes-page">
            <Slidebar isOpen={isOpen} setIsOpen={setIsOpen} />
            <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>☰</button>
            
            <div className="notes-header">
                <h2>Your Notes</h2>
                <button className="add-note-btn" onClick={() => setShowModal(true)}>+ Add Note</button>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{isEditMode ? "Update Entry" : "New Intel"}</h3>
                        <input
                            type="text"
                            placeholder="Title"
                            value={noteForm.title}
                            onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                            disabled={isProcessing}
                        />
                        <textarea
                            placeholder="Log your findings..."
                            value={noteForm.content}
                            onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                            disabled={isProcessing}
                        />
                        <div className="modal-actions">
                            <button onClick={closeModal} disabled={isProcessing}>Cancel</button>
                            <button className="save-btn" onClick={handleSaveNote} disabled={isProcessing}>
                                {isProcessing ? "Syncing..." : isEditMode ? "Update" : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="loading-container"><div className="loader"></div><p>Decrypting database...</p></div>
            ) : (
                <div className="notes-container">
                    {notes.length > 0 ? (
                        <div className="notes-grid">
                            {notes.map((note) => (
                                <div className="note-card" key={note.id}>
                                    <h4>{note.title}</h4>
                                    <p>{note.content}</p>
                                    <div className="note-actions">
                                        <button className="edit-btn" onClick={() => openEditModal(note)} disabled={deletingId === note.id}>Edit</button>
                                        <button className="delete-btn" onClick={() => handleDeleteNote(note.id)} disabled={deletingId === note.id}>
                                            {deletingId === note.id ? "..." : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">📝</div>
                            <h3>No Intelligence Gathered</h3>
                            <p>Your workspace is currently empty.</p>
                            <button className="add-note-btn-large" onClick={() => setShowModal(true)}>Create First Entry</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotesPage;