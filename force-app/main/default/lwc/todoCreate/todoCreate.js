import { LightningElement, api } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { reduceErrors } from 'c/ldsUtils';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import TODO_OBJECT from '@salesforce/schema/Todo__c';
import NAME_FIELD from '@salesforce/schema/Todo__c.Name';
import STATUS_FIELD from '@salesforce/schema/Todo__c.Status__c'
import RECORD_TYPE from '@salesforce/schema/Todo__c.RecordTypeId'
import DESCRIPTION_FIELD from '@salesforce/schema/Todo__c.Description__c'

export default class TodoCreate extends LightningElement {

    @api rtypes;
    
    name = '';
    description = '';
    status = 'Ready to Take';
    recordTypeId;

    createTodo() {
        let field = this.name;
        const valid = (field.trim().length === 0) ? false : true;

        if (valid){
            const fields = {};
            fields[NAME_FIELD.fieldApiName] = this.name;
            fields[STATUS_FIELD.fieldApiName] = this.status;
            fields[RECORD_TYPE.fieldApiName] = this.recordTypeId;
            fields[DESCRIPTION_FIELD.fieldApiName] = this.description;
            const recordInput = { apiName: TODO_OBJECT.objectApiName, fields };
            createRecord(recordInput)
                .then((output) => {
                    let todo = {};
                    todo.Name = this.name;
                    todo.Status__c = this.status;
                    todo.Description__c = this.description;

                    todo.Id = output.id;
                    todo.RecordTypeId = output.recordTypeId;
                    todo.RecordType = {Name:output.recordTypeInfo.name};
                    todo.Owner = {Name:output.fields.CreatedBy.displayValue};
                    let date = output.fields.CreatedDate.value;
                    todo.CreatedDate = date;

                    const createEvent = new CustomEvent('todocreate', {
                        detail: todo
                    });
                    this.dispatchEvent(createEvent);
                })
                .catch((error) => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error creating record',
                            message: reduceErrors(error).join(', '),
                            variant: 'error'
                        })
                    );
                });
            } else {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Could not create',
                        message: 'Name must not be empty',
                        variant: 'error'
                    })
                );
            }
    }

    handleStatus(event) {
        this.status = event.detail.value;
    }
    handleName(event) {
        this.name = event.target.value;
    }
    handleType(event) {
        this.recordTypeId = event.target.value;
    }
    handleDescription(event) {
        this.description = event.target.value;
    }
    cancelCreate() {
        this.dispatchEvent(new CustomEvent('nocreate'));
    }

    get statuses() {
        return [
            { label: 'Ready to Take', value: 'Ready to Take' },
            { label: 'In progress', value: 'In progress' },
            { label: 'Done', value: 'Done' },
        ];
    }
}