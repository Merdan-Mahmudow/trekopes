import { describe, it, expect, beforeEach } from 'vitest';
import store from '..';
import { decreaseBalance, setPhotoData, setSelectedArtist } from '../photo-song';

describe('photoSong store', () => {
  beforeEach(() => {
    // Reset state before each test
    store.setState(state => ({
      ...state,
      photoSong: {
        flowStep: 'photo',
        photoData: null,
        extras: { text: '' },
        styleMode: 'artist',
        selectedArtist: null,
        paramStyle: {},
        balance: 18,
      }
    }));
    localStorage.clear();
  });

  it('should decrease balance correctly', () => {
    const initialBalance = store.state.photoSong.balance;
    decreaseBalance();
    expect(store.state.photoSong.balance).toBe(initialBalance - 1);
  });

  it('should enable generate button when photo and artist are selected', () => {
    setPhotoData({ dataUrl: 'test', w: 100, h: 100 });
    setSelectedArtist({ id: 'test', name: 'Test Artist', avatarUrl: '' });

    const { photoData, selectedArtist, balance } = store.state.photoSong;
    const isEnabled = !!(photoData && selectedArtist && balance >= 1);

    expect(isEnabled).toBe(true);
  });

  it('should disable generate button when photo is missing', () => {
    setSelectedArtist({ id: 'test', name: 'Test Artist', avatarUrl: '' });

    const { photoData, selectedArtist, balance } = store.state.photoSong;
    const isEnabled = !!(photoData && selectedArtist && balance >= 1);

    expect(isEnabled).toBe(false);
  });

  it('should disable generate button when artist is missing', () => {
    setPhotoData({ dataUrl: 'test', w: 100, h: 100 });

    const { photoData, selectedArtist, balance } = store.state.photoSong;
    const isEnabled = !!(photoData && selectedArtist && balance >= 1);

    expect(isEnabled).toBe(false);
  });

  it('should disable generate button when balance is too low', () => {
    store.setState(state => ({ ...state, photoSong: { ...state.photoSong, balance: 0 } }));
    setPhotoData({ dataUrl: 'test', w: 100, h: 100 });
    setSelectedArtist({ id: 'test', name: 'Test Artist', avatarUrl: '' });

    const { photoData, selectedArtist, balance } = store.state.photoSong;
    const isEnabled = !!(photoData && selectedArtist && balance >= 1);

    expect(isEnabled).toBe(false);
  });
});
