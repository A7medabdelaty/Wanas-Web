import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SidebarService {
    // Default state is collapsed (true)
    private readonly _isCollapsed = signal<boolean>(true);

    readonly isCollapsed = this._isCollapsed.asReadonly();

    toggle() {
        this._isCollapsed.update(state => !state);
    }

    setCollapsed(state: boolean) {
        this._isCollapsed.set(state);
    }
}
