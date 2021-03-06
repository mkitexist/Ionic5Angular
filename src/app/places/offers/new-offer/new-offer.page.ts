import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { PlacesService } from './../../places.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
function base64toBlob(base64Data, contentType) {
  contentType = contentType || '';
  const sliceSize = 1024;
  const byteCharacters = atob(base64Data);
  const bytesLength = byteCharacters.length;
  const slicesCount = Math.ceil(bytesLength / sliceSize);
  const byteArrays = new Array(slicesCount);

  for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize;
    const end = Math.min(begin + sliceSize, bytesLength);

    const bytes = new Array(end - begin);
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
}

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss'],
})
export class NewOfferPage implements OnInit {
  form: FormGroup;
  constructor(private placeService: PlacesService, private route: Router, private loadingControl: LoadingController) { }

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      description: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(180)]
      }),
      price: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.minLength(1)]
      }),
      dateFrom: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      dateTo: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      image: new FormControl(null)
    });
  }
  onCreateOffer() {
    if (!this.form.valid || !this.form.get('image').value) {
      return;
    }
    console.log(this.form.value);
    this.loadingControl.create({
      message: 'Creating Place...'
    }).then(loading => {
      loading.present();
      this.placeService.uploadImage(this.form.get('image').value).pipe(switchMap((uploadRes: any) =>
        // eslint-disable-next-line max-len
        this.placeService.addPlace(this.form.value.title, this.form.value.description, this.form.value.price, new Date(this.form.value.dateFrom), new Date(this.form.value.dateTo), uploadRes.imageUrl)
      ))
        .subscribe(() => {
          loading.dismiss();
          this.form.reset();
          this.route.navigate(['/places/offers']);
          console.log(this.form);

        });
    });
  }
  onImagePicked(imageData: string | File) {
    let imageFile;
    if (typeof imageData === 'string') {
      try {
        imageFile = imageData;
        // base64toBlob(imageData.replace('data:image/jpeg;Uri,', ''), 'image/jpeg');
      } catch (err) {
        console.log(err);
        return;
      }
    } else {
      imageFile = imageData;
    }
    this.form.patchValue({ image: imageFile });
  }
}
