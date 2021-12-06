import { Subscription } from 'rxjs';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { BookingService } from './booking.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Booking } from './booking.model';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {
  loadedBookings: Booking[];
  isLoading = false;
  private bookingSub: Subscription;
  constructor(private bookingservice: BookingService, private loadingControl: LoadingController) { }


  ngOnInit() {
    this.bookingSub = this.bookingservice.bookings.subscribe(booking => {
      console.log('bookinggg', booking);

      this.loadedBookings = booking;
      // console.log('loaded', this.loadedBookings);

    });
    // console.log('loaded', this.loadedBookings);
  };
  ionViewWillEnter() {
    this.isLoading = true;
    // this.bookingSub = this.bookingservice.bookings.subscribe(booking => {
    //   console.log('bookinggg', booking);
    //   this.loadedBookings = booking;
    // });
    this.bookingservice.fetchBookings().subscribe(() => {
      this.isLoading = false;
    });
  }
  onCancelBooking(id, slide: IonItemSliding) {
    slide.close();
    this.loadingControl.create({ message: 'canceling....' }).then(loading => {
      loading.present();
      this.bookingservice.cancelBooking(id).subscribe(() => {
        loading.dismiss();
      });
    });
  }
  ngOnDestroy(): void {
    if (this.bookingSub) {
      this.bookingSub.unsubscribe();
    }
  }
}
