import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/_services/authentication.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  @Output() eventMenu = new EventEmitter<boolean>();
  @Input() hide: boolean; // Ukrywanie button MENU

  constructor(private router: Router, private authenticationService: AuthenticationService) { }

  ngOnInit() {
  }

  emitMenuClickEvent() {
    this.eventMenu.emit();
  }

  logout() {
    this.router.navigateByUrl('/login');
    this.authenticationService.logout();
  }

  checkLogin(): boolean { // sprawdzanie czy uzytkownik jest zalogowany
    if (localStorage.getItem('currentUser')) {
      return true;
    } else {
      return false;
    }
  }


}
