import type { PlayerProps, Track } from '../../types/player';
import store from '../';
import { logPlayer, debugLog } from '../../utils/logger';

export const updatePlayerState = (payload: Partial<PlayerProps>) => {
    store.setState((state) => {
        return {
            ...state,
            player: {
                ...state.player,
                ...payload,
            }
        }
    })
}

export const setPlayerPlaying = (isPlaying: boolean) => {
    store.setState((state) => ({
        ...state,
        player: {
            ...state.player,
            isPlaying,
        }
    }))
    
    logPlayer(isPlaying ? 'play' : 'pause', {
        track_id: store.state.player.currentTrackId || undefined
    });
}

export const setCurrentTrack = (id: string | null, src?: string, play = true, title?: string, artist?: string, cover?: string) => {
    debugLog('[Player] Setting current track', { id, title, artist, play });
    
    store.setState((state) => ({
        ...state,
        player: {
            ...state.player,
            currentTrackId: id,
            src: src ?? state.player.src,
            isPlaying: play,
            isVisible: true,
            title,
            artist,
            cover,
        }
    }))
    
    logPlayer('track_change', {
        track_id: id || undefined
    });
    
    if (play) {
        logPlayer('play', { track_id: id || undefined });
    }
}

export const loadQueue = (tracks: Track[], startIndex = 0) => {
    debugLog('[Player] Loading queue', { trackCount: tracks.length, startIndex });
    
    const safeIndex = Math.max(0, Math.min(startIndex, tracks.length - 1));
    const currentTrack = tracks[safeIndex];
    
    store.setState((state) => ({
        ...state,
        player: {
            ...state.player,
            queue: tracks,
            currentIndex: safeIndex,
            currentTrackId: currentTrack?.id ?? null,
            src: currentTrack?.src,
            title: currentTrack?.title,
            artist: currentTrack?.artist,
            cover: currentTrack?.cover,
            isVisible: true,
        }
    }))
    
    logPlayer('track_change', {
        track_id: currentTrack?.id
    });
}

export const playNext = () => {
    store.setState((state) => {
        const { queue, currentIndex } = state.player
        if (!queue || queue.length === 0 || currentIndex === undefined) return state
        const nextIndex = currentIndex + 1
        if (nextIndex >= queue.length) return state
        const nextTrack = queue[nextIndex]
        
        debugLog('[Player] Playing next track', { nextIndex, trackId: nextTrack.id });
        logPlayer('track_change', { track_id: nextTrack.id });
        
        return {
            ...state,
            player: {
                ...state.player,
                currentIndex: nextIndex,
                currentTrackId: nextTrack.id,
                src: nextTrack.src,
                title: nextTrack.title,
                artist: nextTrack.artist,
                cover: nextTrack.cover,
                isPlaying: true,
            }
        }
    })
}

export const playPrev = () => {
    store.setState((state) => {
        const { queue, currentIndex } = state.player
        if (!queue || queue.length === 0 || currentIndex === undefined) return state
        const prevIndex = currentIndex - 1
        if (prevIndex < 0) return state
        const prevTrack = queue[prevIndex]
        
        debugLog('[Player] Playing previous track', { prevIndex, trackId: prevTrack.id });
        logPlayer('track_change', { track_id: prevTrack.id });
        
        return {
            ...state,
            player: {
                ...state.player,
                currentIndex: prevIndex,
                currentTrackId: prevTrack.id,
                src: prevTrack.src,
                title: prevTrack.title,
                artist: prevTrack.artist,
                cover: prevTrack.cover,
                isPlaying: true,
            }
        }
    })
}

export const showPlayer = () => {
    updatePlayerState({ isVisible: true })
}

export const hidePlayer = () => {
    updatePlayerState({ isVisible: false })
}
