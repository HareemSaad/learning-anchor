use anchor_lang::prelude::*;

#[error_code]
pub enum OnlyDeployerError {
    #[msg("Only deployer can call this function!")]
    NotDeployer,
}
