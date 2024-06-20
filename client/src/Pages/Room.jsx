import React, { useEffect, useCallback, useState } from 'react';
import { useSocket } from '../Providers/Socket';
import { usePeer } from '../Providers/Peer';
import ReactPlayer from 'react-player';

export default function Room() {
    const socket = useSocket();
    const { peer, createOffer, createAns, setRemoteAns, sendStream, remoteStream } = usePeer();
    const [myStream, setMyStream] = useState(null);
    const [remoteEmailID, setRemoteEmailID] = useState(null);

    const handleNegotiation = useCallback(() => {
        const localOffer = peer.localDescription;
        socket.emit('call-user', { email: remoteEmailID, offer: localOffer });
    }, [peer.localDescription, remoteEmailID, socket]);

    useEffect(() => {
        peer.addEventListener('negotiationneeded', handleNegotiation);
        return () => {
            peer.removeEventListener('negotiationneeded', handleNegotiation);
        };
    }, [peer]);

    const handleNewUserJoined = useCallback(async (data) => {
        const { email } = data;
        console.log(email);
        const offer = await createOffer();
        socket.emit('call-user', { email, offer });
        setRemoteEmailID(email);
    }, [createOffer, socket]);

    const handleIncomingCall = useCallback(async (data) => {
        const { from, offer } = data;
        console.log(`incoming call from ${from}`, offer);
        const ans = await createAns(offer);
        socket.emit('call-accepted', { email: from, ans });
        setRemoteEmailID(from);
    }, [createAns, socket]);

    const handleCallAccepted = useCallback(async (data) => {
        const { ans } = data;
        console.log("call got accepted", ans);
        await setRemoteAns(ans);
    }, [setRemoteAns]);

    useEffect(() => {
        if (socket) {
            socket.on('user-joined', handleNewUserJoined);
            socket.on('incoming-call', handleIncomingCall);
            socket.on('call-accepted', handleCallAccepted);

            return () => {
                socket.off('user-joined', handleNewUserJoined);
                socket.off('incoming-call', handleIncomingCall);
                socket.off('call-accepted', handleCallAccepted);
            };
        }
    }, [socket, handleNewUserJoined, handleIncomingCall, handleCallAccepted]);

    const getUserMediaStream = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setMyStream(stream);
    }, []);

    useEffect(() => {
        getUserMediaStream();
    }, [getUserMediaStream]);

    return (
        <div>
            You are in the room
            {remoteEmailID}
            <ReactPlayer url={myStream} playing muted />
            <ReactPlayer url={remoteStream} playing />
            <button onClick={() => sendStream(myStream)}>send my video</button>
        </div>
    );
}
