import { makeAutoObservable } from 'mobx';

export default class ResponsiveStore {
  isMobile = window.innerWidth <= 768;

  constructor() {
    makeAutoObservable(this);
    window.addEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    this.isMobile = window.innerWidth <= 768;
  };
}
