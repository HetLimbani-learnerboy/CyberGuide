import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import './Terminal.css';

const TerminalInstance = ({ type, title, color, isLabRunning }) => {
    const terminalRef = useRef(null);
    const socketRef = useRef(null);
    const xtermRef = useRef(null);

    useEffect(() => {
        if (!isLabRunning) return;

        const term = new Terminal({
            cursorBlink: true,
            cursorStyle: 'underline', 
            theme: {
                background: '#0f172a',
                foreground: '#ffffff',
                cursor: color,
                selectionBackground: 'rgba(255, 255, 255, 0.3)',
                green: '#22c55e',
                red: '#ef4444',
                yellow: '#facc15'
            },
            fontFamily: '"Fira Code", monospace',
            fontSize: 14,
            convertEol: true,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);
        fitAddon.fit();

        xtermRef.current = term;

        setTimeout(() => term.focus(), 100);

        const wsUrl = `ws://127.0.0.1:8000/ws/${type}/`;
        socketRef.current = new WebSocket(wsUrl);

        socketRef.current.onmessage = (e) => term.write(e.data);

        term.onData((data) => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(data);
            }
        });

        const handleResize = () => fitAddon.fit();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            socketRef.current?.close();
            term.dispose();
        };
    }, [type, color, isLabRunning]);

    const handleKill = () => {
        socketRef.current?.send("__CTRL_C__");
    };

    const handleForceKill = () => {
        socketRef.current?.send("__KILL__");
    };

    return (
        <div className="terminal-card">
            <div className="terminal-header">
                <div className="terminal-controls">
                    <div className="terminal-dot dot-red"></div>
                    <div className="terminal-dot dot-yellow"></div>
                    <div className="terminal-dot dot-green"></div>
                </div>

                <span className="terminal-title" style={{ color }}>{title}</span>

                {isLabRunning && (
                    <div className="terminal-actions">
                        <button className="btn ctrl" onClick={handleKill}>CTRL+C</button>
                        <button className="btn kill" onClick={handleForceKill}>FORCE</button>
                    </div>
                )}
            </div>

            <div className="terminal-body">
                {isLabRunning ? (
                    <div
                        ref={terminalRef}
                        className="terminal-screen"
                        onClick={() => xtermRef.current?.focus()}
                    />
                ) : (
                    <div className="terminal-offline">[ OFFLINE ]</div>
                )}
            </div>
        </div>
    );
};

export default TerminalInstance;