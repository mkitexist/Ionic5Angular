/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable-next-line @typescript-eslint/naming-convention*/
import { AuthService } from './../auth/auth.service';
import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private placess = new BehaviorSubject<Place[]>([]);
  constructor(private authService: AuthService, private http: HttpClient) { }

  get places() {
    return this.placess.asObservable();
  }
  getSinglePlace(id: string) {
    // return this.places.pipe(take(1), map(places => ({ ...places.find(p => p.id === id) })));
    return this.authService.token.pipe(take(1), switchMap(token => this.http.get<any>(`https://ionic-1c70a-default-rtdb.firebaseio.com/places/${id}.json?auth=${token}`)
    ), map(place => {
      const p = {
        id,
        title: place.title,
        description: place.description,
        imageUrl: place.imageUrl,
        price: place.price,
        availableFrom: new Date(place.availableFrom),
        availableTo: new Date(place.availableTo),
        userId: place.userId
      };
      return p;
    }));

  }
  fetchPlaces() {
    return this.authService.token.pipe(take(1), switchMap(token => this.http.get(`https://ionic-1c70a-default-rtdb.firebaseio.com/places.json?auth=${token}`)), map(res => {
      const places = [];
      for (const key in res) {
        if (res.hasOwnProperty(key)) {
          places.push(
            {
              id: key,
              title: res[key].title,
              description: res[key].description,
              imageUrl: res[key].imageUrl,
              price: res[key].price,
              availableFrom: new Date(res[key].availableFrom),
              availableTo: new Date(res[key].availableTo),
              userId: res[key].userId
            }
          );
        }
      }
      return places;
      // return [];
    }),
      tap(places => {
        this.placess.next(places);
      })
    );
  }
  uploadImage(image: File) {
    const uploadData = new FormData();
    uploadData.append('image', image);

    // eslint-disable-next-line max-len
    return this.authService.token.pipe(take(1), switchMap(token => this.http.post('https://us-central1-ionic-1c70a.cloudfunctions.net/storeImage', uploadData, { headers: { Authorization: 'Bearer' + token } })
    ));


  }
  addPlace(title: string, description: string, price: string, availableFrom: Date, availableTo: Date, imageUrl: string) {
    let generatedId: string;
    let newPlace: Place;
    let fetchedUSerId: string;
    return this.authService.userId.pipe(take(1), switchMap(userid => {
      fetchedUSerId = userid;
      return this.authService.token;
    }
    ),
      take(1),
      switchMap(token => {
        if (!fetchedUSerId) {
          throw new Error('No user Found!');
        }
        newPlace = {
          id: Math.random().toString(),
          title,
          description,
          imageUrl,
          price,
          availableFrom,
          availableTo,
          userId: fetchedUSerId
        };
        return this.http.post<{ name: string }>(`https://ionic-1c70a-default-rtdb.firebaseio.com/places.json?auth=${token}`, {
          ...newPlace, id: null
        });
      }),
      // eslint-disable-next-line @typescript-eslint/no-shadow
      switchMap(res => {
        generatedId = res.name;
        return this.places;
      }), take(1), tap(places => {
        newPlace.id = generatedId;
        this.placess.next(places.concat(newPlace));
      })
    );

    // return this.placess.pipe(take(1), delay(1000), tap(places => {
    //   this.placess.next(places.concat(newPlace));
    // }));
  }
  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    let fetchedToken: string;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    return this.authService.token.pipe(take(1), switchMap(token => {
      fetchedToken = token;
      return this.places;
    }
    ),
      take(1),
      switchMap(places => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }

      }), switchMap(places => {
        const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] =
        {
          id: oldPlace.id,
          title,
          description,
          imageUrl: oldPlace.imageUrl,
          price: oldPlace.price,
          availableFrom: oldPlace.availableFrom,
          availableTo: oldPlace.availableTo,
          userId: oldPlace.userId
        };
        return this.http.put(`https://ionic-1c70a-default-rtdb.firebaseio.com/places/${placeId}.json?auth=${fetchedToken}`, {
          ...updatedPlaces[updatedPlaceIndex], id: null
        });
      }), tap(() => {
        this.placess.next(updatedPlaces);
      })
    );



    // return this.places.pipe(
    //   take(1),
    //   delay(1000),
    //   tap(places => {
    //     const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
    //     const updatedPlaces = [...places];
    //     const oldPlace = updatedPlaces[updatedPlaceIndex];
    //     updatedPlaces[updatedPlaceIndex] =
    //     {
    //       id: oldPlace.id,
    //       title,
    //       description,
    //       imageUrl: oldPlace.imageUrl,
    //       price: oldPlace.price,
    //       availableFrom: oldPlace.availableFrom,
    //       availableTo: oldPlace.availableTo,
    //       userId: oldPlace.userId
    //     };
    //     this.placess.next(updatedPlaces);
    //   })
    // );
  }
  // Request
  // https://us-central1-ionic-1c70a.cloudfunctions.net/storeImage


}



// {
//   id: '1',
//   title: 'newyork',
//   description: 'nuper super',
//   // eslint-disable-next-line max-len

//   availableFrom: new Date('2019-01-01'),
//   availableTo: new Date('2019-12-31'),
//   userId: 'a'

// },
// {
//   id: '2',
//   title: 'bewyork',
//   description: 'buper super',
//   imageUrl: 'https://img.freepik.com/free-photo/view-manhattan-sunset-new-york-city_268835-463.jpg?size=626&ext=jpg',
//   price: '600',
//   availableFrom: new Date('2019-01-01'),
//   availableTo: new Date('2019-12-31'),
//   userId: 'a'

// },
// {
//   id: '3',
//   title: 'cewyork',
//   description: 'cuper super',
//   imageUrl: 'https://images.pexels.com/photos/2246476/pexels-photo-2246476.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
//   price: '700',
//   availableFrom: new Date('2019-01-01'),
//   availableTo: new Date('2019-12-31'),
//   userId: 'a'

// },
// {
//   id: '4',
//   title: 'kewyork',
//   description: 'kuper super',
//   // eslint-disable-next-line max-len

//   price: '800',
//   availableFrom: new Date('2019-01-01'),
//   availableTo: new Date('2019-12-31'),
//   userId: 'a'

// },
