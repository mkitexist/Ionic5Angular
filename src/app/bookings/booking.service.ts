/* eslint-disable max-len */
import { HttpClient } from '@angular/common/http';
import { AuthService } from './../auth/auth.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Booking } from './booking.model';
import { delay, take, tap, switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private bookingss = new BehaviorSubject<Booking[]>([]);

  constructor(private authService: AuthService, private http: HttpClient) { }
  get bookings() {
    console.log('bookings', this.bookingss);
    return this.bookingss.asObservable();
  }
  addBooking(
    placeId: string,
    placeImage: string,
    placeTitle: string,
    guestNumber: number,
    firstName: string,
    lastName: string,
    dateFrom: Date,
    dateTo: Date
  ) {
    let generatedId: string;
    let newBooking: Booking;
    let fetchedUSerId: string;
    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('No user id found!');
        }
        fetchedUSerId = userId;
        return this.authService.token;
      }), take(1),
      switchMap(token => {

        newBooking = {
          id: Math.random().toString(),
          placeId,
          userId: fetchedUSerId,
          placeImage,
          placeTitle,
          guestNumber,
          firstName,
          lastName,
          dateFrom,
          dateTo
        };
        return this.http.post<any>(`https://ionic-1c70a-default-rtdb.firebaseio.com/bookings.json?auth=${token}`, {
          ...newBooking, id: null
        });
      }),
      // }),
      switchMap(res => {
        generatedId = res.name;
        return this.bookings;
      }
      ), take(1), tap(booking => {
        newBooking.id = generatedId;
        this.bookingss.next(booking.concat(newBooking));

      }));
    // return this.bookings.pipe(take(1), delay(1000), tap(booking => {
    //   this.bookingss.next(booking.concat(newBooking));
    // }));
  }
  cancelBooking(id: string) {
    return this.authService.token.pipe(take(1), switchMap(token => this.http.delete<any>(`https://ionic-1c70a-default-rtdb.firebaseio.com/bookings/${id}.json?auth=${token}`)), switchMap(() => this.bookings), take(1), tap(booking => {
      this.bookingss.next(booking.filter((b: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        b.id !== id;
      }));
    }));
    // return this.bookings.pipe(take(1), delay(1000), tap(booking => {
    //   this.bookingss.next(booking.filter(b => {
    //     // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    //     b.id !== id;
    //   }));
    // }));
  }
  fetchBookings() {
    let fetchedUSerId: string;
    return this.authService.userId.pipe(take(1), switchMap(userId => {
      if (!userId) {
        throw new Error('User not found !');
      }
      fetchedUSerId = userId;
      return this.authService.token;

    }), take(1), switchMap(token => this.http.get(`https://ionic-1c70a-default-rtdb.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${fetchedUSerId}"&auth=${token}`)), map((booking: any) => {
      // console.log('bookingmappp', booking);

      const bookings = [];
      for (const key in booking) {
        if (booking.hasOwnProperty(key)) {
          bookings.push({
            id: key,
            placeId: booking[key].placeId,
            userId: booking[key].userId,
            placeImage: booking[key].placeImage,
            placeTitle: booking[key].placeTitle,
            guestNumber: booking[key].guestNumber,
            firstName: booking[key].firstName,
            lastName: booking[key].lastName,
            dateFrom: new Date(booking[key].dateFrom),
            dateTo: new Date(booking[key].dateTo)
          });
        }
      }
      // console.log('bookingdgdg', bookings);
      return bookings;
    }), tap((bookings: any) => {
      // console.log('booking', bookings);
      this.bookingss.next(bookings);
    }));
  }
}
// {
//   id: 'a',
//   placeId: '2',
//   userId: 'abc',
//   placeTitle: 'dhelii',
//   guestNumber: 3
// },
