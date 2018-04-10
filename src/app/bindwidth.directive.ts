import {Directive, Input, OnInit, ElementRef, HostListener, AfterViewInit} from '@angular/core';

@Directive({
  selector: '[appBindWidth]'
})
export class BindwidthDirective implements AfterViewInit {
  @Input("widthFunc") widthFunc;
  constructor(private elementRef: ElementRef) {

  }

  calcWidth() {
    this.widthFunc(this.elementRef.nativeElement.clientWidth);
  }

  ngAfterViewInit() {
    this.calcWidth();
  }

  @HostListener('window:resize', ['$event.target'])
  public onresize() {
    this.calcWidth();
  }
}
