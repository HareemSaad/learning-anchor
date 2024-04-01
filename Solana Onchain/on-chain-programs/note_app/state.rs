use borsh::{BorshSerialize, BorshDeserialize};

// These traits will provide methods on NoteState that we can use to serialize and deserialize the data as needed.
#[derive(BorshSerialize, BorshDeserialize)]
pub struct NoteState {
    title: String,
    body: String,
    id: u64
}