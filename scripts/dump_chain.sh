cd blockparser

cargo build --release

./target/release/rusty-blockparser --blockchain-dir ../blocks/raw csvdump ../blocks/parsed