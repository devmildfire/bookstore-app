import { computed, makeObservable } from 'mobx';

export interface IFilters {
  authors: string[];
  years: string[];
  types: string[];
}

class FilterModel {
  authors: string[];
  years: string[];
  types: string[];

  constructor(data: IFilters) {
    makeObservable<FilterModel>(this);
    this.authors = data.authors;
    this.years = data.years;
    this.types = data.types;

    // makeObservable<FilterModel>(this, {
    //   formData: computed,
    // });
  }

  // get formData() {
  //   return {
  //     authors: this.authors,
  //     years: this.years,
  //     types: this.types,
  //   };
  // }
}

export default FilterModel;
