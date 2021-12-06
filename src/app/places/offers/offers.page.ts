import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonItemSliding } from '@ionic/angular';
import { Place } from '../place.model';
import { PlacesService } from '../places.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {

  offers: Place[];
  private placeSub: Subscription;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  isLoading = false;
  constructor(private placesService: PlacesService, private route: Router) { }


  ngOnInit() {
    this.placeSub = this.placesService.places.subscribe(places => { this.offers = places; });
  }
  ionViewWillEnter() {
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => {
      this.isLoading = false;
    });
  }
  onEdit(id, sliding: IonItemSliding) {
    sliding.close();
    this.route.navigate(['/places/offers/edit', id]);
    // alert(id);
  }
  ngOnDestroy(): void {
    this.placeSub.unsubscribe();
  }

}
