/**
 * Socket Context for shared Socket.IO connection
 * Prevents multiple connections and provides centralized socket management
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '../config/api';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export function SocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Create single shared socket connection
        const newSocket = io(API_CONFIG.socketUrl, {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
            console.log('🔌 Socket connected:', newSocket.id);
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('🔌 Socket disconnected');
            setIsConnected(false);
        });

        newSocket.on('error', (error) => {
            console.error('🔌 Socket error:', error);
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            console.log('🔌 Cleaning up socket connection');
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}

/**
 * Hook to access the shared socket connection
 */
export function useSocket(): SocketContextType {
    const context = useContext(SocketContext);

    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }

    return context;
}

/**
 * Hook for type-safe socket event listeners
 */
export function useSocketEvent<T = any>(
    eventName: string,
    handler: (data: T) => void,
    dependencies: any[] = []
) {
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        socket.on(eventName, handler);

        return () => {
            socket.off(eventName, handler);
        };
    }, [socket, eventName, handler, ...dependencies]);
}

/**
 * Hook to emit socket events with type safety
 */
export function useSocketEmit() {
    const { socket, isConnected } = useSocket();

    return {
        emit: <T = any>(eventName: string, data: T, callback?: (response: any) => void) => {
            if (!socket || !isConnected) {
                console.warn(`Cannot emit ${eventName} - socket not connected`);
                return false;
            }

            if (callback) {
                socket.emit(eventName, data, callback);
            } else {
                socket.emit(eventName, data);
            }

            return true;
        },
        isConnected,
    };
}
