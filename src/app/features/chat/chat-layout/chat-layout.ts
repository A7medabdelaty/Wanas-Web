import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ChatList } from '../chat-list/chat-list';
import { ChatRoom } from '../chat-room/chat-room';

@Component({
    selector: 'app-chat-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, ChatList, ChatRoom],
    templateUrl: './chat-layout.html',
    styleUrls: ['./chat-layout.css']
})
export class ChatLayout implements OnInit {
    selectedChatId: string | null = null;
    isMobileView: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        // Check if we have a child route active (for direct link access)
        // However, with the new design, we might want to handle routing differently
        // For now, let's check window width for mobile view
        this.checkScreenSize();
        window.addEventListener('resize', () => this.checkScreenSize());

        // Check for chatId in query parameters (from listing details navigation)
        this.route.queryParams.subscribe(params => {
            const chatId = params['chatId'];
            if (chatId) {
                this.selectedChatId = chatId;
            }
        });

        // If URL has ID, set it
        const childRoute = this.route.firstChild;
        if (childRoute) {
            childRoute.paramMap.subscribe(params => {
                const id = params.get('id');
                if (id) {
                    this.selectedChatId = id;
                }
            });
        }
    }

    checkScreenSize() {
        this.isMobileView = window.innerWidth <= 768;
    }

    onChatSelected(chatId: string) {
        this.selectedChatId = chatId;
        // Update URL without reloading
        // this.router.navigate(['/chat', chatId]); 
        // Actually, we want to stay on /chat but show the room
        // But to support deep linking, we should probably update the URL
        // Let's keep it simple: The layout handles the view. 
        // If we want deep linking, we can update the URL.

        // For this implementation, let's update the URL so browser back button works
        // But we need to make sure the router doesn't try to reload the whole component tree if we are already in the layout
        // We will handle this by using the layout as the parent route
    }

    onBackToList() {
        this.selectedChatId = null;
        // this.router.navigate(['/chat']);
    }
}
