import * as React from 'react';
import styles from './MergedCalendar.module.scss';
import roomStyles from './Room.module.scss';
import { IMergedCalendarProps } from './IMergedCalendarProps';
//import { escape } from '@microsoft/sp-lodash-subset';

import {IDropdownOption, DefaultButton, PrimaryButton, Panel, IComboBox, IComboBoxOption, MessageBar, MessageBarType, MessageBarButton} from '@fluentui/react';
import {useBoolean} from '@fluentui/react-hooks';

import {CalendarOperations} from '../Services/CalendarOperations';
import {updateCalSettings} from '../Services/CalendarSettingsOps';
import {addToMyGraphCal, getMySchoolCalGUID} from '../Services/CalendarRequests';
import {formatEvDetails} from '../Services/EventFormat';
import {setWpData} from '../Services/WpProperties';
import {getRooms, getPeriods, getLocationGroup, getGuidelines} from '../Services/RoomOperations';

import ICalendar from './ICalendar/ICalendar';
import IPanel from './IPanel/IPanel';
import ILegend from './ILegend/ILegend';
import IDialog from './IDialog/IDialog';
import IRooms from './IRooms/IRooms';
import IRoomBook from './IRoomBook/IRoomBook';
import IRoomDetails from './IRoomDetails/IRoomDetails';
import IRoomDropdown from './IRoomDropdown/IRoomDropdown';
import IRoomGuidelines from './IRoomGuidelines/IRoomGuidelines';

export default function MergedCalendar (props:IMergedCalendarProps) {
  
  const _calendarOps = new CalendarOperations();
  const [eventSources, setEventSources] = React.useState([]);
  // const [filteredEventSources, setFilteredEventSources] = React.useState(eventSources);
  const [calSettings, setCalSettings] = React.useState([]);
  const [eventDetails, setEventDetails] = React.useState({});

  const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false);
  const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);
  const [isDataLoading, { toggle: toggleIsDataLoading }] = useBoolean(false);
  const [showWeekends, { toggle: toggleshowWeekends }] = useBoolean(props.showWeekends);
  const [listGUID, setListGUID] = React.useState('');

  const [rooms, setRooms] = React.useState([]);
  const [roomId, setRoomId] = React.useState(null);
  const [roomInfo, setRoomInfo] = React.useState({});
  const [isOpenDetails, { setTrue: openPanelDetails, setFalse: dismissPanelDetails }] = useBoolean(false);
  const [isOpenBook, { setTrue: openPanelBook, setFalse: dismissPanelBook }] = useBoolean(false);
  const [filteredRooms, setFilteredRooms] = React.useState(rooms);
  const [roomSelectedKey, setRoomSelectedKey] = React.useState<string | number | undefined>('all');
  const [locationGroup, setLocationGroup] = React.useState([]);
  const [periods, setPeriods] = React.useState([]);
  const [guidelines, setGuidelines] = React.useState([]);


  const calSettingsList = props.calSettingsList ? props.calSettingsList : "CalendarSettings";
  const roomsList = props.roomsList ? props.roomsList : "Rooms";
  const periodsList = props.periodsList ? props.periodsList : "Periods";
  const guidelinesList = props.guidelinesList ? props.guidelinesList : "Guidelines";
  
  React.useEffect(()=>{
    _calendarOps.displayCalendars(props.context, calSettingsList, roomId).then((results: any)=>{
      setCalSettings(results[0]);
      setEventSources(results[1]);
    });
    /*getMySchoolCalGUID(props.context, calSettingsList).then((result)=>{
      setListGUID(result);
    });*/
    getRooms(props.context, roomsList).then((results)=>{
      setRooms(results);
      setFilteredRooms(results);
    });
  },[eventSources.length, roomId]);

  React.useEffect(()=>{
    getLocationGroup(props.context, roomsList).then((results)=>{
      setLocationGroup(results);
    });
    getPeriods(props.context, periodsList).then((results)=>{
      setPeriods(results);
    });
    getGuidelines(props.context, guidelinesList).then((results)=>{
      setGuidelines(results);
    });
  }, []);

  const chkHandleChange = (newCalSettings:{})=>{    
    return (ev: any, checked: boolean) => { 
      toggleIsDataLoading();
      updateCalSettings(props.context, calSettingsList, newCalSettings, checked).then(()=>{
        _calendarOps.displayCalendars(props.context, calSettingsList, roomId).then((results:any)=>{
          setCalSettings(results[0]);
          setEventSources(results[1]);
          toggleIsDataLoading();
        });
      });
     };
  };  
  const dpdHandleChange = (newCalSettings:any)=>{
    return (ev: any, item: IDropdownOption) => { 
      toggleIsDataLoading();
      updateCalSettings(props.context, props.calSettingsList, newCalSettings, newCalSettings.ShowCal, item.key).then(()=>{
        _calendarOps.displayCalendars(props.context, props.calSettingsList, roomId).then((results: any)=>{
          setCalSettings(results[0]);
          setEventSources(results[1]);
          toggleIsDataLoading();
        });
      });
     };
  };
  const chkViewHandleChange = (ev: any, checked: boolean) =>{
    toggleIsDataLoading();
    setWpData(props.context, "showWeekends", checked).then(()=>{
      toggleshowWeekends();
      toggleIsDataLoading();
    });
    
  };
  const handleDateClick = (arg:any) =>{
    //console.log(arg);
    //console.log(formatEvDetails(arg));
    setEventDetails(formatEvDetails(arg));
    toggleHideDialog();
  };

  const handleAddtoCal = ()=>{
    addToMyGraphCal(props.context).then((result)=>{
      console.log('calendar updated', result);
    });
  };

  //Filter Rooms
  const onFilterChanged = (ev: React.FormEvent<IComboBox>, option?: IComboBoxOption): void => {
    setRoomSelectedKey(option.key);
    if(option.key === 'all'){
      setFilteredRooms(rooms);
    }else{
      setFilteredRooms(rooms.filter(room => room.LocationGroup.toLowerCase().indexOf(option.text.toLowerCase()) >= 0));
    }
  };

  //Rooms
  const onCheckAvailClick = (roomIdParam: number) =>{
    setRoomId(roomIdParam);
  };
  const onResetRoomsClick = ()=>{
    setRoomId(null);
  };
  const onViewDetailsClick = (roomInfoParam: any) =>{
    setRoomInfo(roomInfoParam);
    dismissPanelBook();
    openPanelDetails();
  };
  const onBookClick = (bookingInfoParam: any) =>{
    setRoomInfo(bookingInfoParam.roomInfo);
    dismissPanelDetails();
    openPanelBook();
  };


  //Booking Forms
  const [formField, setFormField] = React.useState({
    titleField: "",
    descpField: "",
    periodField : {key: '', text:''},
    dateField : "",
    startHrField : {key:'12 AM', text: '12 AM'},
    startMinField : {key:'00', text: '00'},
    endHrField : {key:'12 AM', text: '12 AM'},
    endMinField : {key:'00', text: '00'},
  });
  const onChangeFormField = (formFieldParam: string) =>{
    return (event: any, newValue?: any)=>{
      //Note to self
      //(newValue === undefined && typeof event === "object") //this is for date
      //for date, there is no 2nd param, the newValue is the main one
      //typeof newValue === "boolean" //this one for toggle buttons
      setFormField({
        ...formField,
        [formFieldParam]: (newValue === undefined && typeof event === "object") ? event : (typeof newValue === "boolean" ? !!newValue : newValue || '')
      });
    };
  };

  const [errorMsgField , setErrorMsgField] = React.useState({
    titleField: "",
    linkField: "",
    periodField : {key: '', text:''}
  });
  const resetFields = () =>{
    setFormField({
      titleField: "",
      descpField: "",
      periodField : {key: '', text:''},
      dateField: "",
      startHrField : {key:'12 AM', text: '12 AM'},
      startMinField : {key:'00', text: '00'},
      endHrField : {key:'12 AM', text: '12 AM'},
      endMinField : {key:'00', text: '00'},
    });
    //setErrorMsgField({titleField:"", linkField:""});
  };
  

  return(
    <div className={styles.mergedCalendar}>

      <div style={{float:'left', width: '28%'}}> 
      
        <IRoomDropdown 
          onFilterChanged={onFilterChanged}
          roomSelectedKey={roomSelectedKey}
          locationGroup = {locationGroup}
        />
        <IRooms 
          rooms={filteredRooms} 
          onCheckAvailClick={() => onCheckAvailClick} 
          onBookClick={()=> onBookClick}
          onViewDetailsClick={()=>onViewDetailsClick}
        />
      </div>

      <div style={{float:'left', width: '70%', marginLeft: '2%', position: 'relative'}}>
      <div style={{float:'left', width: '70%', marginLeft: '2%'}}>
        <ICalendar 
          // eventSources={filteredEventSources} 
          eventSources={eventSources} 
          showWeekends={showWeekends}
          openPanel={openPanel}
          handleDateClick={handleDateClick}
          context={props.context}
          listGUID = {listGUID}/>

        <ILegend calSettings={calSettings} />
      </div>

      <IPanel
        dpdOptions={props.dpdOptions} 
        calSettings={calSettings}
        onChkChange={chkHandleChange}
        onDpdChange={dpdHandleChange}
        isOpen = {isOpen}
        dismissPanel = {dismissPanel}
        isDataLoading = {isDataLoading} 
        showWeekends= {showWeekends} 
        onChkViewChange= {chkViewHandleChange}
        />

      <IDialog 
        hideDialog={hideDialog} 
        toggleHideDialog={toggleHideDialog}
        eventDetails={eventDetails}
        handleAddtoCal = {handleAddtoCal}
        />

      <Panel
        isOpen={isOpenDetails}
        onDismiss={dismissPanelDetails}
        headerText="Room Details"
        closeButtonAriaLabel="Close"
        isFooterAtBottom={true}
        isBlocking={false}
        // isLightDismiss={true}
        >
            <IRoomDetails roomInfo={roomInfo} />
            <div className={styles.panelBtns}>
              <DefaultButton className={styles.marginL10} onClick={dismissPanelDetails} text="Cancel" />
            </div>
      </Panel>
      <Panel
        isOpen={isOpenBook}
        onDismiss={dismissPanelBook}
        headerText="Book Room"
        closeButtonAriaLabel="Close"
        isFooterAtBottom={true}
        isBlocking={false}>
         
          <MessageBar
            messageBarType={MessageBarType.warning}
            isMultiline={false}
            truncated={true}
            overflowButtonAriaLabel="See more"
          > 
            <IRoomGuidelines guidelines = {guidelines} /> 
          </MessageBar>

        <IRoomBook 
          formField = {formField}
          errorMsgField={errorMsgField} 
          periodOptions = {periods}
          onChangeFormField={onChangeFormField}
          roomInfo={roomInfo}
        />
        
        <div className={styles.panelBtns}>
          <PrimaryButton text="Book" />
          <DefaultButton className={styles.marginL10} onClick={dismissPanelBook} text="Cancel" />
        </div>
      </Panel>


    </div>
  );
  
  
}
