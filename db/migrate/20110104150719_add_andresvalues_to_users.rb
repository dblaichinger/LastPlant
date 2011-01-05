class AddAndresvaluesToUsers < ActiveRecord::Migration
  def self.up
    add_column :users, :fbid, :string
    add_column :users, :createScore, :integer
    add_column :users, :destroyScore, :integer
	add_column :users, :isFacebook, :boolean
  end

  def self.down
    remove_column :users, :destroyScore
    remove_column :users, :createScore
    remove_column :users, :fbid
  end
end
