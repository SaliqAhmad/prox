export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      chats: {
        Row: {
          created_at: string
          id: string
          isImg: boolean
          message: string
          msgid: string
          receiverid: string
        }
        Insert: {
          created_at?: string
          id: string
          isImg?: boolean
          message: string
          msgid?: string
          receiverid: string
        }
        Update: {
          created_at?: string
          id?: string
          isImg?: boolean
          message?: string
          msgid?: string
          receiverid?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_receiverid_fkey"
            columns: ["receiverid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      groupmembers: {
        Row: {
          groupid: string
          id: string
          userid: string
        }
        Insert: {
          groupid: string
          id?: string
          userid: string
        }
        Update: {
          groupid?: string
          id?: string
          userid?: string
        }
        Relationships: [
          {
            foreignKeyName: "groupmembers_userid_fkey"
            columns: ["userid"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      groupmessages: {
        Row: {
          groupid: string
          id: string
          isImg: boolean
          message: string
          sender: string
          sendername: string
        }
        Insert: {
          groupid: string
          id?: string
          isImg?: boolean
          message: string
          sender: string
          sendername: string
        }
        Update: {
          groupid?: string
          id?: string
          isImg?: boolean
          message?: string
          sender?: string
          sendername?: string
        }
        Relationships: [
          {
            foreignKeyName: "groupmessages_sender_fkey"
            columns: ["sender"]
            isOneToOne: false
            referencedRelation: "groupmembers"
            referencedColumns: ["userid"]
          }
        ]
      }
      groups: {
        Row: {
          groupadmin: string
          groupname: string
          id: string
        }
        Insert: {
          groupadmin: string
          groupname: string
          id?: string
        }
        Update: {
          groupadmin?: string
          groupname?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_groupadmin_fkey"
            columns: ["groupadmin"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      Recent_chats: {
        Row: {
          chat_from: string
          chat_to: string
          id: string
        }
        Insert: {
          chat_from: string
          chat_to: string
          id?: string
        }
        Update: {
          chat_from?: string
          chat_to?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Recent_chats_chat_from_fkey"
            columns: ["chat_from"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Recent_chats_chat_to_fkey"
            columns: ["chat_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          email: string
          id: string
          latitude: number
          longitude: number
          name: string
          password: string
        }
        Insert: {
          email: string
          id: string
          latitude: number
          longitude: number
          name: string
          password: string
        }
        Update: {
          email?: string
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          password?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_test_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
