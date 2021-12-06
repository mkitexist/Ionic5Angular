import { Platform } from '@ionic/angular';
import { Component, OnInit, Output, EventEmitter, ViewChild, Input } from '@angular/core';
import {
  Plugins,
  Capacitor,
} from '@capacitor/core';
import {
  Camera,
  CameraSource,
  CameraResultType
} from '@capacitor/camera';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss']
})
export class ImagePickerComponent implements OnInit {
  @Output() imagePick = new EventEmitter<string | File>();
  @Input() showPreview = false;
  selectedImage: string;
  usePicker = false;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  @ViewChild('filePicker') filePicker: { nativeElement: { click: () => void } };
  constructor(private platform: Platform) { }

  ngOnInit() {
    // console.log('mobile', this.platform.is('mobile'));
    // console.log('hybrid', this.platform.is('hybrid'));
    // console.log('ios', this.platform.is('ios'));
    // console.log('android', this.platform.is('android'));
    // console.log('desktop', this.platform.is('desktop'));
    if ((this.platform.is('mobile') && !this.platform.is('hybrid')) || this.platform.is('desktop')) {
      this.usePicker = true;
    }
  }

  onPickImage() {
    if (!Capacitor.isPluginAvailable('Camera')) {
      this.filePicker.nativeElement.click();
      return;
    }
    Camera.getPhoto({
      quality: 50,
      source: CameraSource.Prompt,
      correctOrientation: true,
      height: 320,
      width: 200,
      resultType: CameraResultType.Uri
      // DataUrl
    })
      .then(image => {
        this.selectedImage = image.webPath;
        this.imagePick.emit(image.webPath);
      })
      .catch(error => {
        if (this.usePicker) {
          this.filePicker.nativeElement.click();
        }
        // console.log(error);
        return false;
      });
  }
  onFileChosen(event: Event) {
    const pickedFile = (event.target as HTMLInputElement).files[0];
    if (!pickedFile) {
      return;
    }
    const fr = new FileReader();
    fr.onload = () => {
      const dataurl = fr.result.toString();
      this.selectedImage = dataurl;
      this.imagePick.emit(pickedFile);
    };
    fr.readAsDataURL(pickedFile);
    console.log(event);
  }
}
