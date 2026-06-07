/**
 * scrollLock.js — Centralized scroll lock manager.
 *
 * Multiple features (boot, hamburger, modal) need to lock/unlock
 * body overflow. This module ensures scroll is ONLY restored when
 * ALL locks are cleared, preventing the race condition where one
 * feature re-enables scroll while another still needs it locked.
 */

const _locks = new Set();

export function lockScroll(id) {
    _locks.add(id);
    document.body.style.overflow = 'hidden';
}

export function unlockScroll(id) {
    _locks.delete(id);
    if (_locks.size === 0) {
        document.body.style.overflow = '';
    }
}

