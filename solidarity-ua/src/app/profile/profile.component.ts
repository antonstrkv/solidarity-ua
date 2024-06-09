import {  Component, OnInit } from '@angular/core';
import { Profile, ProfileService } from './profile.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { Fund, FundsService } from '../funds/funds.service';



@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userName: string
  Sub: Subscription;
  currentProfile: Profile;
  isCopied: boolean = false;
  includeCompleted = false;


  ngOnInit(): void {
    this.route.params.subscribe(
      (params: Params) => {
        this.userName = params['id'];
      }
    );


    this.profileService.fetchProfile(this.userName).subscribe((userProfile: Profile) => {
      this.currentProfile = userProfile;
    });
  }

  ngOnDestroy(): void {
    if (this.Sub) this.Sub.unsubscribe();
  }

  constructor(public profileService: ProfileService, private route: ActivatedRoute, public gatheringsService: FundsService) { }

  toggleIncludeCompleted() {
    this.includeCompleted = !this.includeCompleted;
  }


  getTotalFunds(): number {
    return this.gatheringsService.getFundsList().filter((record: Fund) => record.user.userName === this.userName).length;
  }

  getActiveFunds(): number {
    const currentTime = Date.now();
    return this.gatheringsService.getFundsList().filter(record =>
      record.user.userName === this.userName &&
      record.expireOn > currentTime &&
      record.received < record.goal
    ).length;
  }

  getCompletedFunds(): number {
    return this.gatheringsService.getFundsList().filter(record =>
      record.user.userName === this.userName &&
      record.received >= record.goal
    ).length;
  }

  copyCurrentUrlToClipboard() {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      this.isCopied = true;
      setTimeout(() => {
        this.isCopied = false;
      }, 15000);
    }).catch(err => {
      console.error('Failed to copy URL: ', err);
    });
  }
}
