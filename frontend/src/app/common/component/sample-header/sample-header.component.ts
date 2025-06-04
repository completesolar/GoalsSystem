import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ Add this
import { MenubarModule } from 'primeng/menubar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sample-header',
  standalone: true, // ✅ Important for using imports
  imports: [
    CommonModule,          // ✅ This resolves the *ngIf issue
    MenubarModule,
    SplitButtonModule,
    ButtonModule
  ],
  templateUrl: './sample-header.component.html',
  styleUrls: ['./sample-header.component.scss']
})
export class SampleHeaderComponent implements OnInit {
  isMobile = false;
  menuVisible = false;
splitButtonMenu: any;


  ngOnInit() {
    this.checkScreenSize();
  }

  @HostListener('window:resize', [])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    if (typeof window !== 'undefined') {
      this.isMobile = window.innerWidth < 768;
      if (!this.isMobile) {
        this.menuVisible = true; // Always visible on desktop
      } else {
        this.menuVisible = false; // Hidden by default on mobile
      }
    }
  }
  
  toggleMenu() {
    this.menuVisible = !this.menuVisible;
  }
  userMenu = [
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.logout()
    }
  ];
  
  logout() {
    console.log('Logging out...');
  }
}
