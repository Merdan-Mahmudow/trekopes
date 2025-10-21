import type { PlayerProps } from '../../types/player';
import store from '../';

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
}

export const setCurrentTrack = (id: string | null, src?: string, play = true) => {
    store.setState((state) => ({
        ...state,
        player: {
            ...state.player,
            currentTrackId: id,
            src: src ?? state.player.src,
            isPlaying: play,
            isVisible: true,
        }
    }))
}
