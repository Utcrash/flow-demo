import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-props',
    templateUrl: './props.component.html',
    styleUrls: ['./props.component.scss']
})
export class PropsComponent {
    @Input() nodeDetails: any;
    @Output() closeProps: EventEmitter<any> = new EventEmitter();

    close() {
        this.closeProps.emit()
    }
}
