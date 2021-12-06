import { AuthService } from './../../../auth/auth.service';
import { BookingService } from './../../../bookings/booking.service';
import { OnDestroy } from '@angular/core';
/* eslint-disable max-len */
import { PlacesService } from './../../places.service';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ActionSheetController, ModalController, NavController, LoadingController, AlertController } from '@ionic/angular';
import { CreateBookingComponent } from 'src/app/bookings/create-booking/create-booking.component';
import { Subscription } from 'rxjs';
import { Place } from '../../place.model';
import { switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {

  constructor(private navControl: NavController, private activatedroute: ActivatedRoute, private placeService: PlacesService, private modalcontroler: ModalController, private actionsheetcontroller: ActionSheetController, private bookingService: BookingService, private loadingControl: LoadingController, private authService: AuthService, private alertController: AlertController, private router: Router) { }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  place: Place;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  isBookable = false;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  isLoading = false;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  placeSub: Subscription;
  ngOnInit() {
    this.activatedroute.paramMap.subscribe((parmMap: any) => {
      if (!parmMap.has('placeId')) {
        this.navControl.navigateBack('/places/discover');
        return;
      }
      this.isLoading = true;
      let fetchedUSerId: string;
      this.authService.userId.pipe(take(1), switchMap(userID => {
        if (!userID) {
          throw new Error('Found no user!');
        }
        fetchedUSerId = userID;
        return this.placeService.getSinglePlace(parmMap.get('placeId'));
      })).subscribe(places => {
        this.place = places;
        this.isBookable = places.userId !== fetchedUSerId;
        this.isLoading = false;
      }, error => {
        this.alertController.create({
          header: 'An error occured!',
          message: 'Could not load Place...',
          buttons: [{
            text: 'Okay',
            handler: () => {
              this.router.navigate(['/places/discover']);
            }
          }]
        }).then(elert => {
          elert.present();
        });
      });
    });
    console.log('place', this.place);
  }
  onBookPlace() {
    // this.navControl.navigateBack('/places/discover');//code used to navigate back using nav control of ionic
    // this.navControl.pop();
    this.actionsheetcontroller.create({
      header: 'choose an action',
      buttons: [
        {
          text: 'select Date',
          handler: () => {
            this.openBookinModal('select');
          }

        },
        {
          text: 'Random Date',
          handler: () => {
            this.openBookinModal('random');

          }
        }, {
          text: 'Cancel',
          role: 'cncel'
        }
      ]
    }).then(action => {
      action.present();
    });


  }
  openBookinModal(mode: 'select' | 'random') {
    console.log(mode);
    this.modalcontroler.create({
      component: CreateBookingComponent,
      componentProps: { selectedPlace: this.place, selectedMode: mode }
    }).then(modalEl => {
      modalEl.present();
      return modalEl.onDidDismiss();
    }).then(result => {
      console.log(result.data, result.role);
      if (result.role === 'confirm') {
        this.loadingControl.create({ message: 'Booking Place...' }).then(loading => {
          loading.present();
          const data = result.data.bookingData;
          this.bookingService.addBooking(this.place.id, this.place.imageUrl, this.place.title, data.guestNumber, data.firstName, data.lastName, data.startDate, data.endDate).subscribe(() => {
            loading.dismiss();
          });
          console.log('booked');
        });
      } else {
        console.log('canceld');

      }
    });

  }
  ngOnDestroy(): void {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }

}
