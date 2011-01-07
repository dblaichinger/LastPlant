class Map < ActiveRecord::Base
    attr_accessible :name, :content, :score, :user_id
    
    belongs_to :user
end
