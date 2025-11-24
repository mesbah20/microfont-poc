import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import { KeyclockService } from '../../../core/service/keyclock.service';
import { UserService } from '../../../core/user/user.service';
import { AuthService } from '../../../core/auth/auth.service';



@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit{
  keyclock: KeyclockService = inject(KeyclockService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  slides: any[] = [
    {
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=400&fit=crop',
      title: 'Team Collaboration',
      description: 'Building a stronger workforce together'
    },
    {
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&h=400&fit=crop',
      title: 'Professional Growth',
      description: 'Empowering employees to reach their potential'
    },
    {
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&h=400&fit=crop',
      title: 'Innovation & Success',
      description: 'Leading the future of work'
    },
    {
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=400&fit=crop',
      title: 'Team Excellence',
      description: 'Achieving goals through collaboration'
    }
  ];
  username: string;
  currentSlide = 0;
  private intervalId: any;

  ngOnInit(): void {
    this.userService.user$.subscribe(res => {
      this.username = res.name;
    });
    this.authService.getResources().subscribe(res => {
      //let groupResource = this.groupByModuleId(res.data);
      localStorage.setItem('resourceList', JSON.stringify(res.data))
    })
    this.authService.getUserWiseApplications().subscribe(res => {
      //let groupResource = this.groupByModuleId(res.data);
      localStorage.setItem('appList', JSON.stringify(res.data))
    })
    // auto-slide every 5s
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  groupByModuleId(resources: any[]) {
    const grouped: Record<string, { moduleId: string, moduleName: string, items: any[] }> = {};

    resources.forEach(r => {
      const attrs = r.attributes || {};
      const moduleId = String(attrs.moduleId ?? 'unknown');
      const moduleName = String(attrs.moduleName ?? 'unknown');
      if (!grouped[moduleId]) {
        grouped[moduleId] = { moduleId, moduleName, items: [] };
      }
      grouped[moduleId].items.push(r);
    });
    return grouped;
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  goToSlide(i: number) {
    this.currentSlide = i;
  }
}
