import { AuthService } from './../../auth/auth.service';
import { PlacesService } from './../places.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Place } from '../place.model';
import { MenuController } from '@ionic/angular';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {
  placeSub: Subscription;

  constructor(private placesService: PlacesService, private menucontrol: MenuController, private authService: AuthService) { }
  // eslint-disable-next-line @typescript-eslint/member-ordering
  isLoading = false;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  loadedPlaces: Place[];
  // eslint-disable-next-line @typescript-eslint/member-ordering
  relevantPlaces: Place[];
  // eslint-disable-next-line @typescript-eslint/member-ordering
  loadedPlace: Place[] = [];
  // eslint-disable-next-line @typescript-eslint/member-ordering
  loaded = false;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  listedLoadedPlaces: Place[];
  ngOnInit() {

    this.placeSub = this.placesService.places.subscribe(places => {
      this.loadedPlaces = places;
      this.relevantPlaces = this.loadedPlaces;
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);
    });

    // this.loadedPlaces = this.placesService.getPlaces();
    // this.listedLoadedPlaces = this.loadedPlaces.slice(1);

  }
  // onOpenMenu() {
  //   this.menucontrol.toggle();//to open side menu programatically
  // }
  ionViewWillEnter() {
    // this.loadedPlaces = this.placesService.getPlaces();
    // this.listedLoadedPlaces = this.loadedPlaces.slice(1);
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => {
      this.isLoading = false;
    });

  }
  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    this.authService.userId.pipe(take(1)).subscribe(userId => {

      if (event.detail.value === 'all') {
        this.relevantPlaces = this.loadedPlaces;
        this.listedLoadedPlaces = this.relevantPlaces.slice(1);
      } else {
        this.relevantPlaces = this.loadedPlaces.filter((place) => place.userId !== userId
        );
        this.listedLoadedPlaces = this.relevantPlaces.slice(1);
        console.log(' this.listedLoadedPlaces', this.listedLoadedPlaces);
        console.log(' tthis.relevantPlaces', this.relevantPlaces);
      }
    });
    // console.log('event', event.detail);s

  }
  addPlaceToMainView(id) {
    this.loaded = true;
    this.loadedPlace = this.loadedPlaces.filter((e) => e.id === id);
    console.log(this.loadedPlace);
  }
  ngOnDestroy(): void {
    this.placeSub.unsubscribe();
  }
}
