import { LightningElement, wire } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { reduceErrors } from 'c/ldsUtils';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import TODO_OBJECT from '@salesforce/schema/Todo__c';
import NAME_FIELD from '@salesforce/schema/Todo__c.Name';
import STATUS_FIELD from '@salesforce/schema/Todo__c.Status__c'
import RECORD_TYPE from '@salesforce/schema/Todo__c.RecordTypeId'
import DESCRIPTION_FIELD from '@salesforce/schema/Todo__c.Description__c'
const master = 'Master';
const expired = 'Expired';

export default class TodoCreate extends LightningElement {
    name = '';
    status = 'Ready to Take';
    recordTypeId;
    description;

    @wire(getObjectInfo, { objectApiName: TODO_OBJECT}) objectInfo;

    get recordTypes() {
        var recordtypeinfo = this.objectInfo.data.recordTypeInfos;
        var uiCombobox = [];
        for(var eachRecordtype in recordtypeinfo)
        {
          if(recordtypeinfo.hasOwnProperty(eachRecordtype)
                && recordtypeinfo[eachRecordtype].name != master
                && recordtypeinfo[eachRecordtype].name != expired
            )
          uiCombobox.push({ label: recordtypeinfo[eachRecordtype].name, value: recordtypeinfo[eachRecordtype].recordTypeId })
        }
        return uiCombobox;
    }

    createTodo() {
        const allValid = [...this.template.querySelectorAll('lightning-input')]
        .reduce((validSoFar, inputFields) => {
            inputFields.reportValidity();
            return validSoFar && inputFields.checkValidity();
        }, true);
        if (allValid){
            const fields = {};
            fields[NAME_FIELD.fieldApiName] = this.name;
            fields[STATUS_FIELD.fieldApiName] = this.status;
            fields[RECORD_TYPE.fieldApiName] = this.recordTypeId;
            fields[DESCRIPTION_FIELD.fieldApiName] = this.description;
            const recordInput = { apiName: TODO_OBJECT.objectApiName, fields };
            createRecord(recordInput)
                .then((todo) => {
                    const createEvent = new CustomEvent('success', {
                        detail: 'Todo created!'
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
    handleDescription(event){
        this.description = event.target.value;
    }

    get statuses() {
        return [
            { label: 'Ready to Take', value: 'Ready to Take' },
            { label: 'In progress', value: 'In progress' },
            { label: 'Done', value: 'Done' },
        ];
    }

    cancelCreate(){
        this.dispatchEvent(new CustomEvent('nocreate'));
    }
}