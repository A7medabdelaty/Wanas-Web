import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatLayout } from './chat-layout/chat-layout';

const routes: Routes = [
  { path: '', component: ChatLayout },
  { path: ':id', component: ChatLayout }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatRoutingModule { }
