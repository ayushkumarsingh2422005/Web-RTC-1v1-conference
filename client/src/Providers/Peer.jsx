import React, { createContext, useContext, useMemo, useCallback, useEffect, useState } from 'react';

const PeerContext = createContext(null);

export const usePeer = () => {
    return useContext(PeerContext);
};

export const PeerProvider = ({ children }) => {
    const [remoteStream, setRemoteStream] = useState(null);
    const peer = useMemo(() => {
        const config = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        };
        return new RTCPeerConnection(config);
    }, []);

    const createOffer = useCallback(async () => {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        return offer;
    }, [peer]);

    const createAns = async (offer) => {
        await peer.setRemoteDescription(offer);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        return answer;
    };

    const setRemoteAns = async (ans) => {
        await peer.setRemoteDescription(ans);
    };

    const sendStream = async (stream) => {
        const tracks = stream.getTracks();
        for (const track of tracks) {
            peer.addTrack(track, stream);
        }
    };

    const handleTrackEvent = useCallback((e) => {
        const streams = e.streams;
        setRemoteStream(streams[0]);
    }, []);

    useEffect(() => {
        peer.addEventListener('track', handleTrackEvent);
        return () => {
            peer.removeEventListener('track', handleTrackEvent);
        };
    }, [peer, handleTrackEvent]);

    return (
        <PeerContext.Provider value={{ peer, createOffer, createAns, setRemoteAns, sendStream, remoteStream }}>
            {children}
        </PeerContext.Provider>
    );
};
