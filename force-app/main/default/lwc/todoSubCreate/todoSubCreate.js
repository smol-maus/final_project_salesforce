import { LightningElement, api } from 'lwc';
import NAME_FIELD from '@salesforce/schema/SubTodo__c.Name';
import MASTER_FIELD from '@salesforce/schema/SubTodo__c.Master__c'
import SUB_OBJECT from '@salesforce/schema/SubTodo__c'
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { reduceErrors } from 'c/ldsUtils';
export default class TodoSubCreate extends LightningElement {
    @api master;
    createMode = false;

    handleState() {
        this.createMode = !this.createMode;
    }

    handleSave() {
        const allValid = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputFields) => {
                inputFields.reportValidity();
                return validSoFar && inputFields.checkValidity();
            }, true);
        if (allValid) {
            const fields = {};
            fields[NAME_FIELD.fieldApiName] = this.template.querySelector("[data-field='Name']").value;
            fields[MASTER_FIELD.fieldApiName] = this.master;
            const recordInput = {
                apiName: SUB_OBJECT.objectApiName,
                fields
            };
            createRecord(recordInput)
                .then((todo) => {
                    this.handleState();
                    const subEvent = new CustomEvent('success', {
                        detail: 'Sub goal added!'
                    });
                    this.dispatchEvent(subEvent);
                })
                .catch((error) => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error creating sub goal',
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
}