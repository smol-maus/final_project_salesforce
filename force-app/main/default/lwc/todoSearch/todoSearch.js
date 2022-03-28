import { LightningElement} from 'lwc';
import getSearchedMap from '@salesforce/apex/TodoController.getSearchedMap';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class TodoSearch extends LightningElement {

    query = '';

    handleReset() {
        this.query = '';
        this.handleSearch();
    }

    handleChange(event){
        this.query = event.target.value;
    }

    handleSearch() {
        //const searchKey = this.template.querySelector("[data-field='Search']").value
        const searchKey = this.query;
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
    }
}
