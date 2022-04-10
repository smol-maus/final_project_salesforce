import { LightningElement, api } from 'lwc';

export default class TodoSearch extends LightningElement {

    query = '';
    isAllFields = false;
    @api searched;

    get state() {
        return !this.searched;
    }

    @api
    handleReset() {
        this.query = '';
        this.dispatchEvent(new CustomEvent('reset'));
    }

    handleSearch() {
        if (this.query.trim().length === 0) {
            this.handleReset();
            return;
        }
        this.dispatchEvent(new CustomEvent('search'));
    }

    @api
    search(input) {
        let searched = [];
        let regexp = new RegExp(this.query, 'i');
        if (this.isAllFields == false) {
            searched = input.filter(el => regexp.test(el.key.Name));
        } else {
            searched = input.filter(function (el) {
                if (regexp.test(el.key.Name)) return true;
                if (regexp.test(el.key.Description__c)) return true;
                if (el.value == null) return false;
                for (let sub of el.value) {
                    if (regexp.test(sub.Name)) return true;                     
                }
            });
        }
        return searched;
    }

    handleFields() {
        this.isAllFields = !this.isAllFields;
    }

    handleChange(event) {
        this.query = event.target.value;
    }

    handleEnter(event){
        if(event.keyCode === 13){
            this.handleSearch();
        }
    }
}

/* 
    handleOldSearch() {
        const searchKey = this.query;
        if (this.isAllFields == false || this.query == '') {
            getSearchedMap({ searchKey })
                .then((result) => {
                    const mapData = [];
                    for (let key in result) {
                        let obj = JSON.parse(key);
        
                        let date = obj.CreatedDate
                        date = date.slice(0,26) + ':' + date.slice(-2); //why
                        obj.CreatedDate = date;

                        mapData.push({value:result[key], key:obj});
                    }
                    const findEvent = new CustomEvent('find', {
                        detail: mapData
                    });
                    this.dispatchEvent(findEvent);
                })
                .catch((error) => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error!',
                            message: reduceErrors(error).join(', '),
                            variant: 'error'
                        })
                    );
                });
        } else {
            getFullSearchedMap({ searchKey })
            .then((result) => {
                const mapData = [];
                for (let key in result) {
                    let obj = JSON.parse(key);
    
                    let date = obj.CreatedDate
                    date = date.slice(0,26) + ':' + date.slice(-2); //why
                    obj.CreatedDate = date;

                    mapData.push({value:result[key], key:obj});
                }

                const findEvent = new CustomEvent('find', {
                    detail: mapData
                });
                this.dispatchEvent(findEvent);
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error!',
                        message: reduceErrors(error).join(', '),
                        variant: 'error'
                    })
                );
            });
        }
    } */