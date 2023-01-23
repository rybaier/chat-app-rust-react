// @generated automatically by Diesel CLI.

diesel::table! {
    conversations (id) {
        id -> Text,
        room_id -> Text,
        user_id -> Text,
        content -> Varchar,
        created_at -> Text,
    }
}

diesel::table! {
    rooms (id) {
        id -> Text,
        name -> Varchar,
        last_message -> Text,
        participant_ids -> Text,
        created_at -> Text,
    }
}

diesel::table! {
    users (id) {
        id -> Text,
        username -> Varchar,
        phone -> Varchar,
        created_at -> Text,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    conversations,
    rooms,
    users,
);
