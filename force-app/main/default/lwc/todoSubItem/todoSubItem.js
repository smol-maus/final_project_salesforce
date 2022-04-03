import { LightningElement, api } from 'lwc';
import NAME_FIELD from '@salesforce/schema/SubTodo__c.Name';
import DONE_FIELD from '@salesforce/schema/SubTodo__c.Done__c';
import ID_FIELD from '@salesforce/schema/SubTodo__c.Id';
import { updateRecord } from 'lightning/uiRecordApi';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { reduceErrors } from 'c/ldsUtils';

export default class TodoSubItem extends LightningElement {
    @api sub;
    editMode = false;
    name;
    done;

    connectedCallback(){   
        this.name = this.sub.Name;
        this.done = this.sub.Done__c;
    }

    handleDelete(event){
        const recordId = event.target.dataset.recordid;
        deleteRecord(recordId)
            .then(() => {
                const subEvent = new CustomEvent('success', {
                    detail: 'Sub goal deleted'
                });
                this.dispatchEvent(subEvent);
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting record',
                        message: reduceErrors(error).join(', '),
                        variant: 'error'
                    })
                );
            });
    }

    handleSave(event) {
        const allValid = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputFields) => {
                inputFields.reportValidity();
                return validSoFar && inputFields.checkValidity();
            }, true);
        if (allValid){
            const fields = {};
            fields[ID_FIELD.fieldApiName] = this.sub.Id;
            fields[NAME_FIELD.fieldApiName] = this.template.querySelector("[data-field='Name']").value;
            fields[DONE_FIELD.fieldApiName] = this.template.querySelector("[data-field='Done']").checked;
            const recordInput = { fields };
            
            updateRecord(recordInput)
                .then(() => {
                    this.name = fields[NAME_FIELD.fieldApiName];
                    this.done = fields[DONE_FIELD.fieldApiName];
                    this.handleEdit();
                    this.dispatchEvent( new ShowToastEvent({
                        title: 'Success',
                        message: 'Subgoal updated',
                        variant: 'success'
                    })
                );
                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error creating record',
                            message: error.body.message,
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

    handleEdit() {
        this.editMode = !this.editMode;
    }

}