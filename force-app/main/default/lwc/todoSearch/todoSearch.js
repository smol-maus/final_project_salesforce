import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getSearchedMap from '@salesforce/apex/TodoController.getSearchedMap';
import getFullSearchedMap from '@salesforce/apex/TodoController.getFullSearchedMap';

export default class TodoSearch extends LightningElement {

    query = '';
    allFields = false;

    @api
    currentQuery() {
        return this.query;
    }

    @api
    handleReset() {
        this.query = '';
        this.handleSearch();
    }

    handleFields() {
        this.allFields = !this.allFields;
    }

    handleChange(event) {
        this.query = event.target.value;
    }

    handleEnter(event){
        if(event.keyCode === 13){
            this.handleSearch();
        }
    }

    @api
    handleSearch() {
        const searchKey = this.query;
        if (this.allFields == false || this.query == '') {
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
    }
}
