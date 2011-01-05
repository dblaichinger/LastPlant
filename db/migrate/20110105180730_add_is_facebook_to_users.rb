class AddIsFacebookToUsers < ActiveRecord::Migration
  def self.up
    add_column :users, :isFacebook, :boolean
  end

  def self.down
    remove_column :users, :isFacebook
  end
end
