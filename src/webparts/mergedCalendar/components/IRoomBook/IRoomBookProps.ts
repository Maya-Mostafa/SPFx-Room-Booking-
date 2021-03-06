export interface IRoomBookProps{
    formField: any;
    errorMsgField: any;
    onChangeFormField: any;
    periodOptions: any;
    roomInfo: any;
    children: any;

    eventId: any;
    dismissPanelBook: any;
    bookFormMode: string;
    onNewBookingClick: any;
    onEditBookingClick: any;
    onDeleteBookingClick: any;
    onUpdateBookingClick: any;
    isCreator: boolean;
}