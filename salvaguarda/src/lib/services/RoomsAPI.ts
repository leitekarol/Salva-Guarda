import { collection, addDoc, query, where, getDocs, CollectionReference, documentId } from "firebase/firestore";
import { db } from '../utils/firebase';
import { IRoom, IUser, IRoomType } from "../../definitions";
import { SubscriptionsAPI } from "./SubscriptionsAPI";

export class RoomsAPI {
    static readonly roomsRef: CollectionReference = collection(db, "rooms");
    static readonly subscriptionsRef: CollectionReference = collection(db, "subscriptions");

    static async createRoom(name: string, subject: string, type: IRoomType, creatorId: string, members: string[]): Promise<void> {
        const creationTime = new Date();
        const room = await addDoc(RoomsAPI.roomsRef, {
            createdAt: creationTime,
            lm: creationTime,
            name,
            subject,
            type,
            creatorId,
        });

        members.push(creatorId);
        members.forEach((member) => SubscriptionsAPI.addSubscription(member, room.id));
    }

    static async getUserRooms(uid: string): Promise<IRoom[]> {
        const querySnapshotSubscriptions = await getDocs(query(RoomsAPI.subscriptionsRef, where("uid", "==", uid)));
        const subscribedRooms =  querySnapshotSubscriptions.docs.map((doc) => doc.data().rid);

        if (!subscribedRooms.length) {
            return [];
        }

        const querySnapshotRooms = await getDocs(query(RoomsAPI.roomsRef, where(documentId(), "in", subscribedRooms)));
        return querySnapshotRooms.docs.map((doc) => ({
            _id: doc.id,
            createdAt: doc.data().createdAt,
            lm: doc.data().lm,
            name: doc.data().name,
            subject: doc.data().subject,
            type: doc.data().type,
            creatorId: doc.data().creatorId,
        }));
        
    }

}
