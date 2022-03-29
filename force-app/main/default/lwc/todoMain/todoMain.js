import { LightningElement, track, wire} from 'lwc';
import getTodoMap from '@salesforce/apex/TodoController.getTodoMap';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';
import noHeader from '@salesforce/resourceUrl/NoHeader';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class TodoMain extends LightningElement {
    @track mapData = [];
    wiredResult;
    
    @track displayed; //not used (yet)

    createMode = false;

    handleCreateState(){
        this.createMode = !this.createMode;
    }

    @wire(getTodoMap)
    wiredMap(result) {
        this.wiredResult = result;
        this.mapData = [];
        if (result.data) {
            for (let key in result.data) {
                let obj = JSON.parse(key);

                let date = obj.CreatedDate
                date = date.slice(0,26) + ':' + date.slice(-2); //why
                obj.CreatedDate = date;

                this.mapData.push({value:result.data[key], key:obj});
            }
        } else if (result.error) {
            this.error = result.error;
        }
    }

    handleFind(event){
        this.mapData = event.detail;
    }

    refresh(){
        console.log('рефрешинг');
        return refreshApex(this.wiredResult);
    }

    showSucessToast(message){
        this.refresh();
        this.createMode = false;
        this.dispatchEvent( new ShowToastEvent({
                title: 'Success',
                message: message,
                variant: 'success'
            })
        );
    }

    successEventToast(event){
        this.showSucessToast(event.detail);
    }

    connectedCallback() {
        loadStyle(this, noHeader)
    }
}